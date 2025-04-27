// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { act, useEffect, useState, useCallback } from 'react';
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
  useSuiClient,
} from '@mysten/dapp-kit';
import { useNetworkVariable } from './networkConfig';
import { 
  AlertDialog, 
  Button, 
  Card, 
  Dialog, 
  Flex, 
  Heading, 
  Text, 
  Box,
  Badge,
  Avatar,
  Separator
} from '@radix-ui/themes';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { fromHex, SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';
import { SealClient, SessionKey, getAllowlistedKeyServers } from '@mysten/seal';
import { useParams } from 'react-router-dom';
import { downloadAndDecrypt, getObjectExplorerLink, MoveCallConstructor } from './utils';
import { LockOpen, FileText, Clock, CreditCard, Loader2 } from 'lucide-react';

const TTL_MIN = 10;

export interface FeedData {
  id: string;
  fee: string;
  ttl: string;
  owner: string;
  name: string;
  blobIds: string[];
  subscriptionId?: string;
}

const FeedsToSubscribe: React.FC<{ suiAddress: string }> = ({ suiAddress }) => {
  const suiClient = useSuiClient();
  const { id } = useParams();
  const packageId = useNetworkVariable('packageId');
  const currentAccount = useCurrentAccount();
  
  const [feed, setFeed] = useState<FeedData>();
  const [decryptedFileUrls, setDecryptedFileUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionKey, setCurrentSessionKey] = useState<SessionKey | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers('testnet'),
    verifyKeyServers: false,
  });

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
        },
      }),
  });

  const getFeed = useCallback(async () => {
    if (!id || !suiAddress || !packageId || !suiClient) return;

    try {
      // Get all encrypted objects for the given service id
      const encryptedObjects = await suiClient
        .getDynamicFields({
          parentId: id,
        })
        .then((res) => res.data.map((obj) => obj.name.value as string));

      // Get the current service object
      const service = await suiClient.getObject({
        id: id,
        options: { showContent: true },
      });
      const service_fields = (service.data?.content as { fields: any })?.fields || {};

      // Get all subscriptions for the given sui address
      const res = await suiClient.getOwnedObjects({
        owner: suiAddress,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          StructType: `${packageId}::subscription::Subscription`,
        },
      });

      // Get the current timestamp
      const clock = await suiClient.getObject({
        id: '0x6',
        options: { showContent: true },
      });
      const fields = (clock.data?.content as { fields: any })?.fields || {};
      const current_ms = fields.timestamp_ms;

      // Find an active subscription for the given service if it exists
      const valid_subscription = res.data
        .map((obj) => {
          const fields = (obj!.data!.content as { fields: any }).fields;
          return {
            id: fields?.id.id,
            created_at: parseInt(fields?.created_at),
            service_id: fields?.service_id,
          };
        })
        .filter((item) => item.service_id === service_fields.id.id)
        .find((item) => {
          return item.created_at + parseInt(service_fields.ttl) > current_ms;
        });

      const feed = {
        ...service_fields,
        id: service_fields.id.id,
        blobIds: encryptedObjects,
        subscriptionId: valid_subscription?.id,
      } as FeedData;
      
      setFeed(feed);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError("Failed to fetch feed data. Please try again.");
    }
  }, [id, suiAddress, packageId, suiClient]);

  useEffect(() => {
    // Call getFeed immediately
    getFeed();

    // Set up interval to call getFeed every 3 seconds
    const intervalId = setInterval(() => {
      getFeed();
    }, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [getFeed]);

  const constructMoveCall = (
    packageId: string,
    serviceId: string,
    subscriptionId: string,
  ): MoveCallConstructor => {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${packageId}::subscription::seal_approve`,
        arguments: [
          tx.pure.vector('u8', fromHex(id)),
          tx.object(subscriptionId),
          tx.object(serviceId),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
    };
  };

  const handleSubscribe = async (serviceId: string, fee: number) => {
    if (!currentAccount) return;
    
    setIsLoading(true);
    try {
      const address = currentAccount.address;
      const tx = new Transaction();
      tx.setGasBudget(10000000);
      tx.setSender(address);
      
      const subscription = tx.moveCall({
        target: `${packageId}::subscription::subscribe`,
        arguments: [
          coinWithBalance({
            balance: BigInt(fee),
          }),
          tx.object(serviceId),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });
      
      tx.moveCall({
        target: `${packageId}::subscription::transfer`,
        arguments: [tx.object(subscription), tx.pure.address(address)],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log('Subscription successful:', result);
            await getFeed();
            setIsLoading(false);
          },
          onError: (error) => {
            console.error('Subscription error:', error);
            setError("Failed to subscribe. Please try again.");
            setIsLoading(false);
          }
        },
      );
    } catch (err) {
      console.error('Subscription error:', err);
      setError("An unexpected error occurred during subscription.");
      setIsLoading(false);
    }
  };

  const handleViewFiles = async (
    blobIds: string[],
    serviceId: string,
    fee: number,
    subscriptionId?: string,
  ) => {
    if (!subscriptionId) {
      return handleSubscribe(serviceId, fee);
    }

    setIsLoading(true);
    
    try {
      if (
        currentSessionKey &&
        !currentSessionKey.isExpired() &&
        currentSessionKey.getAddress() === suiAddress
      ) {
        const moveCallConstructor = constructMoveCall(packageId, serviceId, subscriptionId);
        await downloadAndDecrypt(
          blobIds,
          currentSessionKey,
          suiClient,
          client,
          moveCallConstructor,
          setError,
          setDecryptedFileUrls,
          setIsDialogOpen,
          setReloadKey,
        );
        setIsLoading(false);
        return;
      }
      
      setCurrentSessionKey(null);

      const sessionKey = new SessionKey({
        address: suiAddress,
        packageId,
        ttlMin: TTL_MIN,
      });

      signPersonalMessage(
        {
          message: sessionKey.getPersonalMessage(),
        },
        {
          onSuccess: async (result) => {
            await sessionKey.setPersonalMessageSignature(result.signature);
            const moveCallConstructor = constructMoveCall(
              packageId,
              serviceId,
              subscriptionId,
            );
            await downloadAndDecrypt(
              blobIds,
              sessionKey,
              suiClient,
              client,
              moveCallConstructor,
              setError,
              setDecryptedFileUrls,
              setIsDialogOpen,
              setReloadKey,
            );
            setCurrentSessionKey(sessionKey);
            setIsLoading(false);
          },
          onError: (error) => {
            console.error('Signature error:', error);
            setError("Failed to sign the message. Please try again.");
            setIsLoading(false);
          }
        },
      );
    } catch (error: any) {
      console.error('Error handling view files:', error);
      setError(`Error: ${error.message || "Unknown error occurred"}`);
      setIsLoading(false);
    }
  };

  const formatSubscriptionTime = (ttl: string) => {
    const minutes = Math.floor(parseInt(ttl) / 60 / 1000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes ? ` ${remainingMinutes} min` : ''}`;
  };

  const formatMistToSui = (mist: string) => {
    const mistValue = parseInt(mist);
    if (mistValue >= 1000000000) {
      return `${(mistValue / 1000000000).toFixed(2)} SUI`;
    }
    return `${mistValue} MIST`;
  };

  return (
    <Card style={{margin: '0', borderRadius: '12px', overflow: 'hidden' }}>
      {!feed ? (
        <Flex direction="column" align="center" justify="center" gap="4" p="6">
          <Loader2 className="animate-spin" size={32} />
          <Text size="3" color="gray">Loading feed data...</Text>
        </Flex>
      ) : (
        <Box>
          <Box p="6" style={{ borderRadius:'8px', background: 'var(--accent-9)', color: 'white' }}>
            <Heading as="h2" size="5">
              {feed.name}
            </Heading>
            <Flex align="center" gap="2" mt="2">
              <Text size="2">ID: </Text>
              <Badge variant="soft" highContrast>
                <a 
                  href={`https://testnet.suivision.xyz/object/${feed.id}`} //marking this as a link
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {feed.id.substring(0, 8)}...{feed.id.substring(feed.id.length - 4)}
                </a>
              </Badge>
            </Flex>
          </Box>
          
          <Box p="6">
            <Flex direction="column" gap="4">
              {/* Subscription Info */}
              <Flex gap="4" align="center">
                <Flex direction="column" gap="1" style={{ flex: 1 }}>
                  <Flex align="center" gap="2">
                    <CreditCard size={16} />
                    <Text size="2" weight="bold">Subscription Fee</Text>
                  </Flex>
                  <Text size="4" weight="medium">{formatMistToSui(feed.fee)}</Text>
                </Flex>
                
                <Flex direction="column" gap="1" style={{ flex: 1 }}>
                  <Flex align="center" gap="2">
                    <Clock size={16} />
                    <Text size="2" weight="bold">Duration</Text>
                  </Flex>
                  <Text size="4" weight="medium">{formatSubscriptionTime(feed.ttl)}</Text>
                </Flex>
                
                <Flex direction="column" gap="1" style={{ flex: 1 }}>
                  <Flex align="center" gap="2">
                    <FileText size={16} />
                    <Text size="2" weight="bold">Files</Text>
                  </Flex>
                  <Text size="4" weight="medium">{feed.blobIds.length}</Text>
                </Flex>
              </Flex>
              
              <Separator size="4" />
              
              {/* Content Section */}
              <Box>
                {feed.blobIds.length === 0 ? (
                  <Flex direction="column" align="center" gap="4" py="5">
                    <FileText size={40} strokeWidth={1} style={{ opacity: 0.5 }} />
                    <Text size="3" color="gray" align="center">
                      No files available in this feed yet.
                    </Text>
                  </Flex>
                ) : (
                  <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Box pt="3">
                      <Button 
                        size="3"
                        style={{
                          width: '100%',
                          padding: '16px',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onClick={() => handleViewFiles(feed.blobIds, feed.id, Number(feed.fee), feed.subscriptionId)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Flex align="center" gap="2">
                            <Loader2 className="animate-spin" size={18} />
                            <Text>Processing...</Text>
                          </Flex>
                        ) : feed.subscriptionId ? (
                          <Flex align="center" gap="2" justify="center">
                            <LockOpen size={18} />
                            <Text weight="bold">Decrypt & View {feed.blobIds.length} Files</Text>
                          </Flex>
                        ) : (
                          <Flex align="center" gap="2" justify="center">
                            <CreditCard size={18} />
                            <Text weight="bold">
                              Subscribe for {formatMistToSui(feed.fee)} • {formatSubscriptionTime(feed.ttl)}
                            </Text>
                          </Flex>
                        )}
                      </Button>
                    </Box>
                    
                    {decryptedFileUrls.length > 0 && (
                      <Dialog.Content style={{ maxWidth: '650px', width: '100%' }} key={reloadKey}>
                        <Dialog.Title>Decrypted Files ({decryptedFileUrls.length})</Dialog.Title>
                        <Separator size="4" my="3" />
                        
                        <Box style={{ maxHeight: '70vh', overflowY: 'auto', padding: '8px' }}>
                          <Flex direction="column" gap="4">
                            {decryptedFileUrls.map((url, index) => (
                              <Card key={index} style={{ overflow: 'hidden' }}>
                                <img 
                                  src={url} 
                                  alt={`Decrypted file ${index + 1}`} 
                                  style={{ 
                                    width: '100%', 
                                    height: 'auto',
                                    display: 'block'
                                  }} 
                                />
                              </Card>
                            ))}
                          </Flex>
                        </Box>
                        
                        <Flex gap="3" mt="4" justify="end">
                          <Dialog.Close>
                            <Button 
                              variant="soft" 
                              color="gray" 
                              onClick={() => setDecryptedFileUrls([])}
                            >
                              Close
                            </Button>
                          </Dialog.Close>
                        </Flex>
                      </Dialog.Content>
                    )}
                  </Dialog.Root>
                )}
              </Box>
            </Flex>
          </Box>
        </Box>
      )}
      
      {/* Error Dialog */}
      <AlertDialog.Root open={!!error} onOpenChange={() => setError(null)}>
        <AlertDialog.Content style={{ maxWidth: '450px' }}>
          <AlertDialog.Title>Error</AlertDialog.Title>
          <AlertDialog.Description size="2">{error}</AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Action>
              <Button variant="solid" color="gray" onClick={() => setError(null)}>
                Close
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Card>
  );
};

export default FeedsToSubscribe;
