// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
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
import { FiLock, FiBell, FiUploadCloud, FiUsers, FiDollarSign } from 'react-icons/fi';

function LandingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-8">
        Choose Your Access Model
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center h-full space-y-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FiUsers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Allowlist System</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
              Create curated access lists with granular control. Manage encrypted content distribution
              through selective allowlist permissions with real-time updates.
            </p>
            <Link 
              to="/allowlist-example" 
              className="mt-auto w-full md:w-auto"
            >
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <FiLock className="w-5 h-5" />
                <span>Explore Allowlist</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center h-full space-y-6">
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
              <FiDollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Subscription System</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
              Monetize content access with time-bound subscriptions. Automate NFT-based access control
              with expiration policies and premium content gating.
            </p>
            <Link 
              to="/subscription-example" 
              className="mt-auto w-full md:w-auto"
            >
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <FiBell className="w-5 h-5" />
                <span>Explore Subscriptions</span>
              </button>
            </Link>
          </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://placehold.co/40x40" 
                alt="Seal Logo" 
                className="h-8 w-8 rounded-full ring-2 ring-blue-500"
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SEAL Protocol</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton 
                className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4 text-blue-800 dark:text-blue-200">
            <FiInfo className="w-6 h-6 flex-shrink-0 mt-1" />
            <div className="space-y-3 text-sm">
              <p>🚀 Code available on <a href="https://github.com/MystenLabs/seal/tree/main/examples" className="underline hover:text-blue-600 dark:hover:text-blue-400">GitHub</a></p>
              <p>🔗 Testnet-only: Use <a href="https://faucet.sui.io/" className="underline hover:text-blue-600 dark:hover:text-blue-400">Sui Faucet</a> for test tokens</p>
              <p>⏳ Uploaded files expire after 1 epoch</p>
              <p>🖼️ Currently supports image files only</p>
            </div>
          </div>
        </div>

        {currentAccount ? (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/allowlist-example/*"
                element={
                  <div className="space-y-8">
                    <Routes>
                      <Route path="/" element={<CreateAllowlist />} />
                      <Route
                        path="/admin/allowlist/:id"
                        element={
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="space-y-8">
                              <Allowlist
                                setRecipientAllowlist={setRecipientAllowlist}
                                setCapId={setCapId}
                              />
                              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2">
                                  <FiUploadCloud className="w-5 h-5" />
                                  <span>Content Upload</span>
                                </h3>
                                <WalrusUpload
                                  policyObject={recipientAllowlist}
                                  cap_id={capId}
                                  moduleName="allowlist"
                                />
                              </div>
                            </div>
                          </div>
                        }
                      />
                      <Route path="/admin/allowlists" element={<AllAllowlist />} />
                      <Route
                        path="/view/allowlist/:id"
                        element={<Feeds suiAddress={currentAccount.address} />}
                      />
                    </Routes>
                  </div>
                }
              />
              <Route
                path="/subscription-example/*"
                element={
                  <div className="space-y-8">
                    <Routes>
                      <Route path="/" element={<CreateService />} />
                      <Route
                        path="/admin/service/:id"
                        element={
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="space-y-8">
                              <Service
                                setRecipientAllowlist={setRecipientAllowlist}
                                setCapId={setCapId}
                              />
                              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2">
                                  <FiUploadCloud className="w-5 h-5" />
                                  <span>Premium Content Upload</span>
                                </h3>
                                <WalrusUpload
                                  policyObject={recipientAllowlist}
                                  cap_id={capId}
                                  moduleName="subscription"
                                />
                              </div>
                            </div>
                          </div>
                        }
                      />
                      <Route path="/admin/services" element={<AllServices />} />
                      <Route
                        path="/view/service/:id"
                        element={<FeedsToSubscribe suiAddress={currentAccount.address} />}
                      />
                    </Routes>
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="text-4xl">🔒</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Connect Your Wallet to Continue
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please link your wallet to access the SEAL management interface
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} SEAL Protocol. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
