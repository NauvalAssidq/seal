// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import {
  Card,
  Flex,
  Heading,
  Text,
  Link as RadixLink,
  Box,
  Strong,
  Spinner,
  Badge,
  Grid,
  Button,
  Separator,
  Dialog,
  TextField,
  IconButton,
} from '@radix-ui/themes';
import { 
  Clock, 
  CreditCard, 
  Share2, 
  BookOpen, 
  Settings, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNetworkVariable } from './networkConfig';
import { getObjectExplorerLink } from './utils';

export interface Service {
  id: string;
  fee: number; // Fee in MIST
  ttl: number; // Time-to-live in milliseconds
  owner: string;
  name: string;
}

interface ServiceProps {
  setRecipientAllowlist: React.Dispatch<React.SetStateAction<string>>;
  setCapId: React.Dispatch<React.SetStateAction<string>>;
}

export function SubscriptionServiceAdminView({ setRecipientAllowlist, setCapId }: ServiceProps) {
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable('packageId');
  const currentAccount = useCurrentAccount();
  const [service, setService] = useState<Service | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!currentAccount?.address || !id) {
      setIsLoading(false);
      setErrorMessage("Wallet connection or service ID is missing");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    async function getServiceAndCap() {
      try {
        // 1. Fetch Service Object
        const serviceRes = await suiClient.getObject({
          id: id!,
          options: { showContent: true },
        });

        if (!isMounted) return;

        const serviceFields = (serviceRes.data?.content as { fields: any })?.fields;
        if (!serviceFields) {
          setErrorMessage("Service details could not be loaded");
          setService(undefined);
          return;
        }

        const fetchedService: Service = {
          id: id!,
          fee: parseInt(serviceFields.fee || '0', 10),
          ttl: parseInt(serviceFields.ttl || '0', 10),
          owner: serviceFields.owner,
          name: serviceFields.name || 'Unnamed Service',
        };
        setService(fetchedService);
        setRecipientAllowlist(id!);

        // 2. Fetch Capability Object
        const capRes = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          options: { showContent: true, showType: true },
          filter: { StructType: `${packageId}::subscription::Cap` },
        });

        if (!isMounted) return;

        const relevantCap = capRes.data
          .map((obj) => {
            const capFields = (obj?.data?.content as { fields: any })?.fields;
            return {
              capId: capFields?.id?.id,
              serviceId: capFields?.service_id,
            };
          })
          .find((item) => item.serviceId === id);

        if (relevantCap?.capId) {
          setCapId(relevantCap.capId);
        } else {
          setCapId('');
        }

      } catch (error) {
        console.error('Error fetching service or cap:', error);
        if (isMounted) {
          setService(undefined);
          setErrorMessage("Error loading service details. Please try again.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    getServiceAndCap();
    const intervalId = setInterval(getServiceAndCap, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [id, currentAccount?.address, suiClient, packageId, setRecipientAllowlist, setCapId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareableLink = `${window.location.origin}/subscription-example/view/service/${service?.id}`;

  // Loading state
  if (isLoading) {
    return (
      <Card variant="surface" size="3">
        <Flex align="center" justify="center" gap="3" p="6">
          <Spinner size="3" />
          <Text size="3">Loading service details...</Text>
        </Flex>
      </Card>
    );
  }

  // Error state
  if (errorMessage || !service) {
    return (
      <Card variant="surface" size="3">
        <Flex direction="column" align="center" justify="center" gap="3" p="6">
          <AlertTriangle size={24} color="var(--red-9)" />
          <Text color="red" size="3" align="center">
            {errorMessage || "Service not found or could not be loaded."}
          </Text>
          <Text size="2" color="gray" align="center">
            Please check the service ID and try again.
          </Text>
        </Flex>
      </Card>
    );
  }

  // Calculate derived values
  const durationMinutes = service.ttl > 0 ? (service.ttl / (60 * 1000)) : 0;
  const feeDisplay = service.fee !== undefined ? `${service.fee} MIST` : 'Not Set';
  const explorerHref = getObjectExplorerLink(service.id);

  // Main content
  return (
    <Card variant="surface" size="3">
      {/* Service Header */}
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2" mb="1">
          <Settings size={20} color="var(--accent-9)" />
          <Heading as="h2" size="6">
            {service.name || 'Unnamed Service'}
          </Heading>
          <Badge variant="soft" color="blue" radius="full">
            Admin View
          </Badge>
        </Flex>
        
        <Flex align="center" gap="2">
          <a
            href={`https://testnet.suivision.xyz/object/${service.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Text size="2" color="gray">
              ID: {service.id.substring(0, 8)}...{service.id.substring(service.id.length - 8)}
            </Text>
          </a>
          <IconButton
            size="1"
            variant="ghost"
            onClick={() => window.open(`https://testnet.suivision.xyz/object/${service.id}`, '_blank')}
          >
            <ExternalLink size={14} />
          </IconButton>
        </Flex>
        
        {/* Main Content Grid */}
        <Grid columns={{ initial: '1', sm: '1' }} gap="4" mt="2">
          {/* Service Details Card */}
          <Card variant="outline">
            <Flex direction="column" gap="4" p="3">
              <Heading size="3">Service Details</Heading>
              
              <Grid columns="2" gap="3" mt="1">
                <Flex direction="column" gap="1">
                  <Flex align="center" gap="2">
                    <Clock size={16} color="var(--accent-9)" />
                    <Text size="2" color="gray">Duration</Text>
                  </Flex>
                  <Text size="4" weight="medium">{durationMinutes.toFixed(1)} minutes</Text>
                </Flex>
                
                <Flex direction="column" gap="1">
                  <Flex align="center" gap="2">
                    <CreditCard size={16} color="var(--accent-9)" />
                    <Text size="2" color="gray">Fee</Text>
                  </Flex>
                  <Text size="4" weight="medium">{feeDisplay}</Text>
                </Flex>
              </Grid>
            </Flex>
          </Card>
          
          {/* Shareable Link Section */}
          <Card variant="outline">
            <Flex direction="column" gap="3" p="3">
              <Flex align="center" gap="2">
                <Share2 size={16} color="var(--accent-9)" />
                <Heading size="3">Share With Subscribers</Heading>
              </Flex>
              
              <Text size="2" color="gray">
                Users can subscribe and access content through this link:
              </Text>
              
              <Flex gap="2" align="center">
                <TextField.Root 
                  size="2" 
                  style={{ 
                    flexGrow: 1,
                    background: 'var(--gray-3)',
                    borderRadius: '6px'
                  }}
                  readOnly
                  value={shareableLink}
                />
                <IconButton 
                  size="2" 
                  variant="soft"
                  color={copied ? "green" : "gray"}
                  onClick={() => copyToClipboard(shareableLink)}
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </IconButton>
              </Flex>
              
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button variant="soft" size="2">
                    <BookOpen size={14} />
                    <Text size="2" style={{ marginLeft: '6px' }}>View Subscription Instructions</Text>
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Title>How Users Subscribe</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Share these instructions with potential subscribers.
                  </Dialog.Description>
                  
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text weight="bold" size="2">1. Visit the service link</Text>
                      <Text size="2">Users should click the link you share with them.</Text>
                    </Box>
                    <Box>
                      <Text weight="bold" size="2">2. Connect wallet</Text>
                      <Text size="2">They'll need to connect their Sui wallet with sufficient funds.</Text>
                    </Box>
                    <Box>
                      <Text weight="bold" size="2">3. Pay subscription fee</Text>
                      <Text size="2">They'll pay {feeDisplay} to subscribe for {durationMinutes.toFixed(1)} minutes.</Text>
                    </Box>
                    <Box>
                      <Text weight="bold" size="2">4. Access content</Text>
                      <Text size="2">After subscribing, they can decrypt and view all associated content.</Text>
                    </Box>
                  </Flex>
                  
                  <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                      <Button variant="soft">Close</Button>
                    </Dialog.Close>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </Flex>
          </Card>
        </Grid>
        
        <Separator size="4" my="3" />
        
        <Flex align="center" gap="2">
          <Text size="2" color="gray">
            Upload encrypted content below that will be available only to subscribers.
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}

// Export using the appropriate name
export { SubscriptionServiceAdminView as Service };