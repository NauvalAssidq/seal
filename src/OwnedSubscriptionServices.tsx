// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState, useCallback } from 'react';
import { useNetworkVariable } from './networkConfig';
import { 
  Button, 
  Card, 
  Flex, 
  Heading, 
  Text, 
  Box, 
  Separator,
  Badge 
} from '@radix-ui/themes';
import { getObjectExplorerLink } from './utils';
import { Loader2, ExternalLink } from 'lucide-react';

export interface Cap {
  id: string;
  service_id: string;
}

export interface CardItem {
  id: string;
  fee: string;
  ttl: string;
  name: string;
  owner: string;
}

export function AllServices() {
  const packageId = useNetworkVariable('packageId');
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const [cardItems, setCardItems] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCapObj = useCallback(async () => {
    if (!currentAccount?.address) return;
    
    try {
      // get all owned cap objects
      const res = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          StructType: `${packageId}::subscription::Cap`,
        },
      });
      
      const caps = res.data
        .map((obj) => {
          const fields = (obj!.data!.content as { fields: any }).fields;
          return {
            id: fields?.id.id,
            service_id: fields?.service_id,
          };
        })
        .filter((item) => item !== null) as Cap[];

      // get all services of all the owned cap objects
      const cardItems: CardItem[] = await Promise.all(
        caps.map(async (cap) => {
          const service = await suiClient.getObject({
            id: cap.service_id,
            options: { showContent: true },
          });
          const fields = (service.data?.content as { fields: any })?.fields || {};
          return {
            id: cap.service_id,
            fee: fields.fee,
            ttl: fields.ttl,
            owner: fields.owner,
            name: fields.name,
          };
        }),
      );
      
      setCardItems(cardItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setIsLoading(false);
    }
  }, [currentAccount?.address, packageId, suiClient]);

  useEffect(() => {
    // Call getCapObj immediately
    getCapObj();

    // Set up interval to call getCapObj every 3 seconds
    const intervalId = setInterval(() => {
      getCapObj();
    }, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [getCapObj]);

  const formatTime = (ttl: string) => {
    if (!ttl) return 'N/A';
    const minutes = Math.floor(parseInt(ttl) / 60 / 1000);
    return `${minutes} minutes`;
  };

  return (
    <Box style={{ maxWidth: '100%' }}>
      {isLoading ? (
        <Flex align="center" justify="center" py="6">
          <Loader2 className="animate-spin" size={24} />
        </Flex>
      ) : cardItems.length === 0 ? (
        <Card size="2" style={{ padding: '16px', textAlign: 'center' }}>
          <Text color="gray">No subscription services found.</Text>
        </Card>
      ) : (
        <Flex direction="column" gap="3">
          {cardItems.map((item) => (
            <Card key={item.id} style={{ overflow: 'hidden' }}>
              <Flex direction="column" gap="3" p="3">
                <Flex justify="between" align="center">
                  <Heading size="3">
                    {item.name}
                  </Heading>
                  <Badge variant="soft" radius="full">
                    <a 
                      href={`https://testnet.suivision.xyz/object/${item.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Text size="1">ID: {item.id.substring(0, 6)}...{item.id.substring(item.id.length - 4)}</Text>
                      <ExternalLink size={12} />
                    </a>
                  </Badge>
                </Flex>
                
                <Separator size="4" />
                
                <Flex direction="row" gap="4">
                  <Box>
                    <Text size="2" weight="bold" color="gray">Subscription Fee: </Text>
                    <Text size="3">{item.fee} MIST</Text>
                  </Box>
                  
                  <Box>
                    <Text size="2" weight="bold" color="gray">Duration: </Text>
                    <Text size="3">{formatTime(item.ttl)}</Text>
                  </Box>
                </Flex>
                
                <Flex justify="end" mt="2">
                  <Button 
                    onClick={() => {
                      window.open(
                        `${window.location.origin}/subscription-example/admin/service/${item.id}`,
                        '_blank',
                      );
                    }}
                  >
                    Manage
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Box>
  );
}