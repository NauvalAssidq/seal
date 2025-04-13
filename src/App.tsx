// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Box, Button, Card, Container, Flex, Grid } from '@radix-ui/themes';
import { CreateAllowlist } from './CreateAllowlist';
import { Allowlist } from './Allowlist';
import WalrusUpload from './EncryptAndUpload';
import { useState } from 'react';
import { CreateService } from './CreateSubscriptionService';
import FeedsToSubscribe from './SubscriptionView';
import { Service } from './SubscriptionService';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AllAllowlist } from './OwnedAllowlists';
import { AllServices } from './OwnedSubscriptionServices';
import Feeds from './AllowlistView';

function LandingPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex flex-col items-center space-y-4 h-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Allowlist Example</h2>
          <p className="text-gray-600 text-center flex-1">
            Shows how a creator can define an allowlist based access. The creator first creates an
            allowlist and can add or remove users in the list. The creator can then associate
            encrypted files to the allowlist. Only users in the allowlist have access to decrypt
            the files.
          </p>
          <Link 
            to="/allowlist-example" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try it
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex flex-col items-center space-y-4 h-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Example</h2>
          <p className="text-gray-600 text-center flex-1">
            Shows how a creator can define a subscription based access to its published files. The
            creator defines subscription fee and how long a subscription is valid for. The creator
            can then associate encrypted files to the service. Only users who have purchased a
            subscription (NFT) have access to decrypt the files, along with the condition that the
            subscription must not have expired.
          </p>
          <Link 
            to="/subscription-example" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try it
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  const currentAccount = useCurrentAccount();
  const [recipientAllowlist, setRecipientAllowlist] = useState<string>('');
  const [capId, setCapId] = useState<string>('');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="https://placehold.co/40x40" 
                alt="Seal Logo" 
                className="h-8 w-8 rounded-full"
              />
              <h1 className="text-2xl font-bold text-gray-900 ml-3">Seal Example Apps</h1>
            </div>
            <div className="flex items-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. Code is available{' '}
              <a href="https://github.com/MystenLabs/seal/tree/main/examples" className="text-blue-600 hover:underline">
                here
              </a>.
            </p>
            <p>2. These examples are for Testnet only. Make sure your wallet is set to Testnet and has
              some balance (can request from{' '}
              <a href="https://faucet.sui.io/" className="text-blue-600 hover:underline">
                faucet.sui.io
              </a>).
            </p>
            <p>3. Blobs are only stored on Walrus Testnet for 1 epoch by default, older files cannot be
              retrieved even if you have access.</p>
            <p>4. Currently only image files are supported, and the UI is minimal, designed for demo
              purposes only!</p>
          </div>
        </div>

        {currentAccount ? (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/allowlist-example/*"
                element={
                  <Routes>
                    <Route path="/" element={<CreateAllowlist />} />
                    <Route
                      path="/admin/allowlist/:id"
                      element={
                        <div className="space-y-6">
                          <Allowlist
                            setRecipientAllowlist={setRecipientAllowlist}
                            setCapId={setCapId}
                          />
                          <WalrusUpload
                            policyObject={recipientAllowlist}
                            cap_id={capId}
                            moduleName="allowlist"
                          />
                        </div>
                      }
                    />
                    <Route path="/admin/allowlists" element={<AllAllowlist />} />
                    <Route
                      path="/view/allowlist/:id"
                      element={<Feeds suiAddress={currentAccount.address} />}
                    />
                  </Routes>
                }
              />
              <Route
                path="/subscription-example/*"
                element={
                  <Routes>
                    <Route path="/" element={<CreateService />} />
                    <Route
                      path="/admin/service/:id"
                      element={
                        <div className="space-y-6">
                          <Service
                            setRecipientAllowlist={setRecipientAllowlist}
                            setCapId={setCapId}
                          />
                          <WalrusUpload
                            policyObject={recipientAllowlist}
                            cap_id={capId}
                            moduleName="subscription"
                          />
                        </div>
                      }
                    />
                    <Route path="/admin/services" element={<AllServices />} />
                    <Route
                      path="/view/service/:id"
                      element={<FeedsToSubscribe suiAddress={currentAccount.address} />}
                    />
                  </Routes>
                }
              />
            </Routes>
          </BrowserRouter>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Please connect your wallet to continue</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
