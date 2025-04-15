import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, FileText, Award, Search, DollarSign, Lock } from 'lucide-react';

const HelpPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "How do I get my identity verified?",
      answer: "To get verified, upload valid government ID proof (Passport, Driver's License, or National ID) through your profile page. Our land inspector will review your documents and verify your identity within 24-48 hours. You'll receive a notification once your verification is complete."
    },
    {
      question: "What blockchain technology does this application use?",
      answer: "Our land registration dApp is built on the Ethereum blockchain, using smart contracts to ensure transparent, secure, and immutable land ownership records. All transactions are recorded on the Ethereum blockchain, providing a permanent and tamper-proof record of land ownership."
    },
    {
      question: "How do I list my land for sale?",
      answer: "To list your land for sale, first ensure you're verified and have a connected wallet. Navigate to the Seller Dashboard, click on 'Add Land,' fill in all required property details including area, location, survey number, and PID. Upload property images and relevant documents, set your price in ETH, and submit. Once approved by a land inspector, your property will be listed on the marketplace."
    },
    {
      question: "What fees are involved in buying or selling land?",
      answer: "There is a small transaction fee (gas fee) required to execute the smart contract on the Ethereum network. The exact amount varies based on network congestion. Our platform doesn't charge additional fees for listing or purchasing properties, making the process more affordable than traditional land registration."
    },
    {
      question: "How do I make a payment for land purchase?",
      answer: "After your purchase request is approved by the seller, navigate to the 'Make Payment' section in your Buyer Dashboard. You'll see all approved land requests. Click on 'Pay Now' for the property you wish to purchase. Confirm the transaction in your connected wallet (ensure you have sufficient ETH), and the payment will be securely transferred to the seller through our smart contract."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take security seriously. Your personal information is encrypted and stored securely. While your identity verification status is recorded on the blockchain, your actual documents and personal details are not. Land ownership records are publicly visible on the blockchain, but personal information is protected."
    },
    {
      question: "What happens if I lose access to my wallet?",
      answer: "If you lose access to your wallet, you may lose access to your account and properties registered under that wallet address. We strongly recommend backing up your wallet seed phrase securely. Contact our support team immediately if you lose access to your wallet, and we'll try to assist you with the recovery process."
    },
    {
      question: "How long does the entire property transfer process take?",
      answer: "The entire process can be completed in as little as 3-5 days, significantly faster than traditional methods. This includes verification (1-2 days), property listing approval (1 day), buyer request approval (depends on seller), and final transaction confirmation on the blockchain (minutes)."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Need Help?
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-xl text-gray-500">
            Get answers to all your questions about our blockchain-based land registration platform
          </p>
        </div>
      </div>

      {/* Overview Section */}
      <div className="max-w-7xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Registration</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Create an account as a buyer or seller. Complete your profile and submit identity 
                  verification documents. Connect your Ethereum wallet to interact with our platform.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Verification</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Land inspectors verify your identity and authenticate property documents.
                  This ensures all users and properties on our platform are legitimate and
                  legally compliant.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Property Listing</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Sellers can list their land with details like location, area, survey number,
                  property images, and official documents. Land inspectors approve listings
                  before they appear on the marketplace.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Buyers browse properties, submit purchase requests, and pay in ETH through
                  our secure smart contract. Sellers review and approve requests before finalizing
                  the transaction.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Ownership Transfer</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Upon payment confirmation, ownership is automatically transferred via smart
                  contract. The blockchain creates an immutable record of the transaction,
                  ensuring permanent proof of ownership.
                </p>
              </div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Support</h3>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">
                  Get help anytime with our comprehensive support resources. Contact our team
                  for assistance with verification, property listing, transactions, or any
                  other questions about our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Flow */}
      <div className="max-w-7xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Registration Process</h2>
        
        <div className="relative">
          {/* Process steps with connecting lines */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="relative flex items-start md:flex-row">
              <div className="md:flex-1 md:text-right md:pr-12">
                <div className="md:inline-block text-left">
                  <h3 className="text-xl font-semibold text-gray-900">Create Account</h3>
                  <p className="mt-2 text-gray-600">
                    Register as a buyer or seller and fill in your basic details.
                    Connect your Ethereum wallet to interact with the platform.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white ring-8 ring-white absolute md:relative md:left-auto md:transform-none left-0">
                <span className="font-bold">1</span>
              </div>
              <div className="md:flex-1 md:pl-12 pl-12 md:pl-0">
                <div className="md:hidden mt-3 mb-5 font-bold bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">1</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start md:flex-row">
              <div className="md:flex-1 md:text-right md:pr-12 order-1 md:order-1">
                <div className="md:hidden mt-3 mb-5 font-bold bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">2</div>
              </div>
              <div className="flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white ring-8 ring-white absolute md:relative md:left-auto md:transform-none left-0 order-3 md:order-2">
                <span className="font-bold">2</span>
              </div>
              <div className="md:flex-1 md:pl-12 pl-12 md:pl-0 order-2 md:order-3">
                <div className="md:inline-block text-left">
                  <h3 className="text-xl font-semibold text-gray-900">Identity Verification</h3>
                  <p className="mt-2 text-gray-600">
                    Submit your identity documents for verification. A land inspector will
                    verify your identity to ensure platform security.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start md:flex-row">
              <div className="md:flex-1 md:text-right md:pr-12">
                <div className="md:inline-block text-left">
                  <h3 className="text-xl font-semibold text-gray-900">Property Registration (Sellers)</h3>
                  <p className="mt-2 text-gray-600">
                    Add your land details including location, area, survey number, price, and
                    upload relevant documents and images for verification.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white ring-8 ring-white absolute md:relative md:left-auto md:transform-none left-0">
                <span className="font-bold">3</span>
              </div>
              <div className="md:flex-1 md:pl-12 pl-12 md:pl-0">
                <div className="md:hidden mt-3 mb-5 font-bold bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">3</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-start md:flex-row">
              <div className="md:flex-1 md:text-right md:pr-12 order-1 md:order-1">
                <div className="md:hidden mt-3 mb-5 font-bold bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">4</div>
              </div>
              <div className="flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white ring-8 ring-white absolute md:relative md:left-auto md:transform-none left-0 order-3 md:order-2">
                <span className="font-bold">4</span>
              </div>
              <div className="md:flex-1 md:pl-12 pl-12 md:pl-0 order-2 md:order-3">
                <div className="md:inline-block text-left">
                  <h3 className="text-xl font-semibold text-gray-900">Purchase Requests (Buyers)</h3>
                  <p className="mt-2 text-gray-600">
                    Browse available properties, view details, and submit purchase requests
                    for properties you're interested in buying.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative flex items-start md:flex-row">
              <div className="md:flex-1 md:text-right md:pr-12">
                <div className="md:inline-block text-left">
                  <h3 className="text-xl font-semibold text-gray-900">Payment & Transfer</h3>
                  <p className="mt-2 text-gray-600">
                    Once a request is approved by the seller, make payment in ETH through the
                    secure smart contract. Ownership is automatically transferred upon payment.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white ring-8 ring-white absolute md:relative md:left-auto md:transform-none left-0">
                <span className="font-bold">5</span>
              </div>
              <div className="md:flex-1 md:pl-12 pl-12 md:pl-0">
                <div className="md:hidden mt-3 mb-5 font-bold bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">5</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <div key={index} className="bg-white shadow overflow-hidden rounded-lg">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                {openFaqIndex === index ? 
                  <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                }
              </button>
              
              {openFaqIndex === index && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;