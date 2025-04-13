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
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14v8H4a8 8 0 0 1 8-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm9 4h1v5h-8v-5h1v-1a3 3 0 0 1 6 0v1zm-2 0v-1a1 1 0 0 0-2 0v1h2z"/>
              </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>Explore Allowlist</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center h-full space-y-6">
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a3 3 0 0 1 3 3v1.07c3.39.49 6 3.39 6 6.93a7 7 0 0 1-7 7 7 7 0 0 1-7-7c0-3.53 2.61-6.44 6-6.93V5a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v1h2V5a1 1 0 0 0-1-1zm-5 9a5 5 0 0 0 10 0h-2a3 3 0 0 1-6 0H7z"/>
              </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
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
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4 text-blue-800 dark:text-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
            </svg>
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
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                  </svg>
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
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                  </svg>
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
