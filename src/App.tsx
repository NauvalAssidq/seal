// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Separator,
  Link as RadixLink,
  Avatar,
  Badge,
  Section,
} from '@radix-ui/themes';
import { 
  FileCheck, 
  PanelRight, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight, 
  Github, 
  BookOpen, 
  MessageCircle,
  ListChecks,
  Ticket,
  Users,
  Upload,
  FileUp,
  FileText,
  Home 
} from 'lucide-react';
import { CreateAllowlist } from './CreateAllowlist';
import { Allowlist } from './Allowlist';
import WalrusUpload from './EncryptAndUpload';
import { CreateService } from './CreateSubscriptionService';
import FeedsToSubscribe from './SubscriptionView';
import { Service } from './SubscriptionService';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AllAllowlist } from './OwnedAllowlists';
import { AllServices } from './OwnedSubscriptionServices';
import Feeds from './AllowlistView';

const FeatureCard = ({ title, icon, description, buttonText, linkTo }) => (
  <Card 
    variant="surface" 
    size="3"
    style={{
      borderRadius: '12px',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    }}
    className="hover:shadow-md hover:border-blue-400"
  >
    <Flex direction="column" gap="4" align="stretch" style={{ height: '100%' }}>
      <Flex direction="column" align="center" gap="2" mt="2">
        <Box style={{ 
          background: 'var(--accent-3)', 
          borderRadius: '50%', 
          width: '48px', 
          height: '48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--accent-9)'
        }}>
          {icon}
        </Box>
        <Heading as="h2" size="6" align="center">
          {title}
        </Heading>
      </Flex>
      
      <Box flexGrow="1" px="2"> 
        <Text as="p" size="3" color="gray" align="center">
          {description}
        </Text>
      </Box>
      
      <Flex justify="center" mt="4" mb="2"> 
        <Link to={linkTo}>
          <Button size="3" variant="soft" style={{ width: '160px' }}>
            {buttonText} <ArrowRight size={16} style={{ marginLeft: '4px' }} />
          </Button>
        </Link>
      </Flex>
    </Flex>
  </Card>
);

function LandingPage() {
  return (
    <Section size="3">
      <Flex direction="column" gap="6" align="center" mb="6">
        <Heading size="8" align="center">Seal Example Applications</Heading>
        <Text size="4" color="gray" align="center" style={{ maxWidth: '640px' }}>
          Explore secure, blockchain-based content access control using Seal on Sui.
        </Text>
      </Flex>
      
      <Grid columns={{ initial: '1', sm: '2' }} gap="6" width="100%">
        <FeatureCard 
          title="Allowlist Example"
          icon={<ListChecks size={24} />}
          description="Control access to encrypted content with a creator-defined allowlist. Add or remove users, and only those on the list can decrypt associated files."
          buttonText="Try Allowlist"
          linkTo="/allowlist-example"
        />
        
        <FeatureCard 
          title="Subscription Example"
          icon={<Ticket size={24} />}
          description="Set up subscription-based access to your content. Define fees and durations. Only users with valid subscription NFTs can decrypt your protected files."
          buttonText="Try Subscription"
          linkTo="/subscription-example"
        />
      </Grid>
    </Section>
  );
}

function App() {
  const currentAccount = useCurrentAccount();
  const [recipientAllowlist, setRecipientAllowlist] = useState('');
  const [capId, setCapId] = useState('');

  return (
    <Container size="4" px="4" py="5">
      <Flex
        position="sticky"
        top="0"
        py="3"
        px={{ initial: '2', sm: '4' }}
        mb="5"
        justify="between"
        align="center"
        style={{
          backgroundColor: 'var(--color-background)',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}
      >
        <Flex gap="3" align="center">
          <Avatar 
            fallback="🦭" 
            size="3" 
            radius="full"
            style={{ 
              backgroundColor: 'var(--accent-9)',
              color: 'white' 
            }} 
          />
          <Heading as="h1" size={{ initial: '5', sm: '6' }} weight="bold">
            Seal Examples
          </Heading>
        </Flex>
        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Separator size="4" mb="6" />

      {/* Informational Card */}
      <Card 
        variant="surface" 
        style={{ 
          marginBottom: '2rem',
          borderLeft: '4px solid var(--accent-9)',
          borderRadius: '6px',
        }}
      >
        <Flex direction="column" gap="3" p="1">
          <Flex align="center" gap="2">
            <AlertCircle size={18} color="var(--blue-9)" />
            <Heading as="h3" size="4">Important Notes</Heading>
          </Flex>
          
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Github size={14} />
              <Text as="p" size="2">
                <RadixLink href="https://github.com/MystenLabs/seal/tree/main/examples" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>
                  View source code on GitHub
                </RadixLink>
              </Text>
            </Flex>
            
            <Flex align="center" gap="2">
              <Badge color="amber" variant="soft">Testnet Only</Badge>
              <Text as="p" size="2">
                Ensure your wallet is set to Testnet and funded via{' '}
                <RadixLink href="https://faucet.sui.io/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>
                  faucet.sui.io
                </RadixLink>
              </Text>
            </Flex>
            
            <Flex align="center" gap="2">
              <AlertCircle size={14} color="var(--red-9)" />
              <Text as="p" size="2">
                Blobs are stored on Walrus Testnet temporarily (approx. 1 epoch). Older files may become inaccessible.
              </Text>
            </Flex>
            
            <Flex align="center" gap="2">
              <FileUp size={14} />
              <Text as="p" size="2">
                Current demo showcases image uploads with a minimal UI intended for demonstration purposes.
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>

      <Box pt="4"> 
        {currentAccount ? (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/allowlist-example/*"
                element={
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <Section size="3">
                          <Flex direction="column" gap="6">
                            <Flex direction="column" gap="2" mb="2">
                              <Flex align="center" gap="2">
                                <ListChecks size={20} color="var(--accent-9)" />
                                <Heading size="7">Allowlist Management</Heading>
                              </Flex>
                              <Text size="3" color="gray">Create and manage access control for your content</Text>
                            </Flex>
                            <CreateAllowlist />
                            <Flex justify="end" mt="4">
                              <Link to="/">
                                <Button variant="ghost" size="2">
                                  <Home size={14} /> <Text size="2" style={{ marginLeft: '6px' }}>Back to Home</Text>
                                </Button>
                              </Link>
                            </Flex>
                          </Flex>
                        </Section>
                      } 
                    />
                    <Route
                      path="/admin/allowlist/:id"
                      element={
                        <Section size="3">
                          <Flex direction="column" gap="6">
                            <Flex direction="column" gap="2" mb="2">
                              <Flex align="center" gap="2">
                                <Users size={20} color="var(--accent-9)" />
                                <Heading size="7">Allowlist Administration</Heading>
                              </Flex>
                              <Text size="3" color="gray">Manage users and upload protected content</Text>
                            </Flex>
                            <Allowlist
                              setRecipientAllowlist={setRecipientAllowlist}
                              setCapId={setCapId}
                            />
                            <Separator size="4" decorative />
                            <Flex align="center" gap="2" mb="2">
                              <Upload size={18} color="var(--accent-9)" />
                              <Heading size="5">Upload Protected Content</Heading>
                            </Flex>
                            <WalrusUpload
                              policyObject={recipientAllowlist}
                              cap_id={capId}
                              moduleName="allowlist"
                            />
                            <Flex justify="end" mt="4">
                              <Link to="/allowlist-example">
                                <Button variant="ghost" size="2">
                                  <Home size={14} /> <Text size="2" style={{ marginLeft: '6px' }}>Back to Allowlists</Text>
                                </Button>
                              </Link>
                            </Flex>
                          </Flex>
                        </Section>
                      }
                    />
                    <Route 
                      path="/admin/allowlists" 
                      element={
                        <Section size="3">
                          <Flex direction="column" gap="6">
                            <Flex direction="column" gap="2" mb="2">
                              <Flex align="center" gap="2">
                                <PanelRight size={20} color="var(--accent-9)" />
                                <Heading size="7">Your Allowlists</Heading>
                              </Flex>
                              <Text size="3" color="gray">View and manage all allowlists you've created</Text>
                            </Flex>
                            <AllAllowlist />
                            <Flex justify="end" mt="4">
                              <Link to="/allowlist-example">
                                <Button variant="ghost" size="2">
                                  <Home size={14} /> <Text size="2" style={{ marginLeft: '6px' }}>Back to Allowlists</Text>
                                </Button>
                              </Link>
                            </Flex>
                          </Flex>
                        </Section>
                      } 
                    />
                    <Route
                      path="/view/allowlist/:id"
                      element={
                        <Section size="3">
                          <Flex direction="column" gap="6">
                            <Flex direction="column" gap="2" mb="2">
                              <Flex align="center" gap="2">
                                <FileText size={20} color="var(--accent-9)" />
                                <Heading size="7">Allowlist Content</Heading>
                              </Flex>
                              <Text size="3" color="gray">View content available to you through this allowlist</Text>
                            </Flex>
                            <Feeds suiAddress={currentAccount.address} />
                            <Flex justify="end" mt="4">
                              <Link to="/allowlist-example">
                                <Button variant="ghost" size="2">
                                  <Home size={14} /> <Text size="2" style={{ marginLeft: '6px' }}>Back to Allowlists</Text>
                                </Button>
                              </Link>
                            </Flex>
                          </Flex>
                        </Section>
                      }
                    />
                  </Routes>
                }
              />
              <Route
                path="/subscription-example/*"
                element={
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <Section size="3">
                          <Flex direction="column" gap="6">
                            <Flex direction="column" gap="2" mb="2">
                              <Flex align="center" gap="2">
                                <Ticket size={20} color="var(--accent-9)" />
                                <Heading size="7">Subscription Service</Heading>
                              </Flex>
                              <Text size="3" color="gray">Create a subscription-based content service</Text>
                            </Flex>
                            <CreateService />
                            <Flex justify="end" mt="4">
                              <Link to="/">
                                <Button variant="ghost" size="2">
                                  <Home size={14} /> <Text size="2" style={{ marginLeft: '6px' }}>Back to Home</Text>
                                </Button>
                              </Link>
                            </Flex>
                          </Flex>
                        </Section>
                      } 
                    />
                    <Route
                      path="/admin/service/:id"
                      element={
                        <Section size="3">
                          <Flex direction="column" gap="6">
                            <Flex direction="column" gap="2" mb="2">
                              <Flex align="center" gap="2">
                                <FileCheck size={20} color="var(--accent-9)" />
                                <Heading size="7">Service Administration</Heading>
                              </Flex>
                              <Text size="3" color="gray">Manage subscription settings and content</Text>
                            </Flex>
                            <Service
                              setRecipientAllowlist={setRecipientAllowlist}
                              setCapId={setCapId}
                            />
                            <Separator size="4" decorative />
                            <Flex align="center" gap="2" mb="2">
                              <Upload size={18} color="var(--accent-9)" />
                              <Heading size="5">Upload Subscription Content</Heading>
                            </Flex>
                            <WalrusUpload
                              policyObject={recipientAllowlist}
                              cap_id={capId}
                              moduleName="subscription"
                            />
                            <Flex justify="end" mt="4">
                              <Link to="/subscription-example">
                                <Button variant="ghost" size="2">
                                  <Home size={14} /> <Text size="2" style={{ marginLeft: '6px' }}>Back to Services</Text>
                                </Button>
                              </Link>
                            </Flex>
                          </Flex>
                        </Section>
                      }
                    />
                    <Route 
                      path="/admin/services" 
                      element={
                        <Section size="3">
                          <Flex direction="column" gap="6">
                            <Flex direction="column" gap="2" mb="2">
                              <Flex align="center" gap="2">
                                <PanelRight size={20} color="var(--accent-9)" />
                                <Heading size="7">Your Services</Heading>
                              </Flex>
                              <Text size="3" color="gray">View and manage all subscription services you've created</Text>
                            </Flex>
                            <AllServices />
                            <Flex justify="end" mt="4">
                              <Link to="/subscription-example">
                                <Button variant="ghost" size="2">
                                  <Home size={14} /> <Text size="2" style={{ marginLeft: '6px' }}>Back to Services</Text>
                                </Button>
                              </Link>
                            </Flex>
                          </Flex>
                        </Section>
                      } 
                    />
                    <Route
                      path="/view/service/:id"
                      element={
                        <Section size="3">
                          <Flex direction="column" gap="6">
                            <Flex direction="column" gap="2" mb="2">
                              <Flex align="center" gap="2">
                                <FileText size={20} color="var(--accent-9)" />
                                <Heading size="7">Subscription Content</Heading>
                              </Flex>
                              <Text size="3" color="gray">View content available with your subscription</Text>
                            </Flex>
                            <FeedsToSubscribe suiAddress={currentAccount.address} />
                            <Flex justify="end" mt="4">
                              <Link to="/subscription-example">
                                <Button variant="ghost" size="2">
                                  <Home size={14} /> <Text size="2" style={{ marginLeft: '6px' }}>Back to Services</Text>
                                </Button>
                              </Link>
                            </Flex>
                          </Flex>
                        </Section>
                      }
                    />
                  </Routes>
                }
              />
            </Routes>
          </BrowserRouter>
        ) : (
          // Enhanced wallet connection prompt with icon
          <Card 
            variant="surface" 
            mt="6"
            style={{
              borderRadius: '12px',
              background: 'linear-gradient(to bottom right, var(--indigo-2), var(--blue-2))',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            <Flex direction="column" gap="4" align="center" p="6">
              <Box style={{ 
                background: 'var(--accent-9)', 
                borderRadius: '50%', 
                width: '64px', 
                height: '64px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white'
              }}>
                <Box style={{ fontSize: '32px' }}>👋</Box>
              </Box>
              <Heading size="6" align="center">Welcome to Seal Examples</Heading>
              <Text color="gray" align="center" style={{ maxWidth: '320px' }}>
                Connect your Sui wallet to explore secure content sharing with blockchain-based access control.
              </Text>
              <Box mt="4">
                <ConnectButton />
              </Box>
            </Flex>
          </Card>
        )}
      </Box>

      {/* Footer */}
      <Box mt="8" pt="4">
        <Separator size="4" mb="4" />
        <Flex justify="between" align="center" wrap="wrap" gap="4">
          <Text size="2" color="gray">© 2025 Mysten Labs</Text>
          <Flex gap="4">
            <Flex align="center" gap="1">
              <Github size={14} />
              <RadixLink href="https://github.com/MystenLabs/seal" target="_blank" size="2">GitHub</RadixLink>
            </Flex>
            <Flex align="center" gap="1">
              <BookOpen size={14} />
              <RadixLink href="https://docs.sui.io" target="_blank" size="2">Sui Docs</RadixLink>
            </Flex>
            <Flex align="center" gap="1">
              <MessageCircle size={14} />
              <RadixLink href="https://discord.gg/sui" target="_blank" size="2">Discord</RadixLink>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
}

export default App;