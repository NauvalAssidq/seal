// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useCallback, useEffect, useState } from 'react';
import { useNetworkVariable } from './networkConfig';
import { Button, Card, Flex, Heading, Text, Box, Separator, Badge } from '@radix-ui/themes';
import { getObjectExplorerLink } from './utils';
import { ExternalLink, List, Users } from 'lucide-react';

export interface Cap {
  id: string;
  allowlist_id: string;
}

export interface CardItem {
  cap_id: string;
  allowlist_id: string;
  list: string[];
  name: string;
}

export function AllAllowlist() {
  const packageId = useNetworkVariable('packageId');
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const [cardItems, setCardItems] = useState<CardItem[]>([]);

  const getCapObj = useCallback(async () => {
    if (!currentAccount?.address) return;

    try {
      const res = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        options: {
          showContent: true,
          showType: true,
        },
        filter: {
          StructType: `${packageId}::allowlist::Cap`,
        },
      });
      const caps = res.data
        .map((obj) => {
          const fields = (obj!.data!.content as { fields: any }).fields;
          return {
            id: fields?.id.id,
            allowlist_id: fields?.allowlist_id,
          };
        })
        .filter((item) => item !== null) as Cap[];

      const cardItems: CardItem[] = await Promise.all(
        caps.map(async (cap) => {
          const allowlist = await suiClient.getObject({
            id: cap.allowlist_id,
            options: { showContent: true },
          });
          const fields = (allowlist.data?.content as { fields: any })?.fields || {};
          return {
            cap_id: cap.id,
            allowlist_id: cap.allowlist_id,
            list: fields.list,
            name: fields.name,
          };
        }),
      );

      setCardItems(cardItems);
    } catch (error) {
      console.error("Error fetching allowlists:", error);
    }
  }, [currentAccount?.address, packageId, suiClient]);

  useEffect(() => {
    getCapObj();
  }, [getCapObj]);

  return (
    <Box style={{ maxWidth: '100%' }}>
        {cardItems.length === 0 ? (
          <Card style={{ padding: '16px', textAlign: 'center' }}>
            <Flex direction="column" align="center" justify="center" gap="2" py="4">
              <List size={24} strokeWidth={1.5} style={{ opacity: 0.6 }} />
              <Text color="gray">No allowlists found.</Text>
            </Flex>
          </Card>
        ) : (
          cardItems.map((item) => (
            <Card key={`${item.cap_id}-${item.allowlist_id}`} style={{ overflow: 'hidden', marginBottom: '1rem' }}>
              <Flex direction="column" gap="3" p="4">
                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Users size={18} />
                    <Heading size="3">{item.name}</Heading>
                  </Flex>
                  <Badge variant="soft" radius="full">
                    <a 
                      href={getObjectExplorerLink(item.allowlist_id).toString()}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Text size="1">ID: {item.allowlist_id.substring(0, 6)}...{item.allowlist_id.substring(item.allowlist_id.length - 4)}</Text>
                      <ExternalLink size={12} />
                    </a>
                  </Badge>
                </Flex>
                <Separator size="4" />
                <Flex align="center" gap="1">
                  <Text size="2" weight="bold" color="gray">Addresses in list:</Text>
                  <Text size="2">{item.list.length}</Text>
                </Flex>
                <Flex justify="end" mt="2">
                  <Button 
                    onClick={() => {
                      window.open(
                        `${window.location.origin}/allowlist-example/admin/allowlist/${item.allowlist_id}`,
                        '_blank',
                      );
                    }}
                  >
                    Manage
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))
        )}
    </Box>
  );
}
