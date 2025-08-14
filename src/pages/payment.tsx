import React, { useState, useRef, useCallback, useEffect } from "react";
import AdminLayout from "../components/layout";
import { CreditCard, QrCode, X, Camera } from "lucide-react";
import Button from "../components/button";
import Card from "../components/card";
import Modal from "../components/modal";
import Input from "../components/Input";
import { usePayment, useClaimPayment } from "../contexts/use-payment";
import { Html5QrcodeScanner } from "html5-qrcode";

type PaymentErrors = {
  recipientAccount?: string;
  amount?: string;
  currency?: string;
};

const Payment = () => {
  const [recipientAccount, setRecipientAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("GHC");
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAccountInputModal, setShowAccountInputModal] = useState(false);
  const [accountInputValue, setAccountInputValue] = useState("");
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementId = "qr-reader";

  const { payment } = usePayment();
  const { claimPayment } = useClaimPayment();

  const formatAccountNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleRecipientAccountChange = (e: { target: { value: string } }) => {
    const formatted = formatAccountNumber(e.target.value);
    setRecipientAccount(formatted);
    if (errors.recipientAccount) {
      setErrors((prev) => ({ ...prev, recipientAccount: "" }));
    }
  };

  const handleAmountChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setAmount(e.target.value);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const handleCurrencyChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setCurrency(e.target.value);
    if (errors.currency) {
      setErrors((prev) => ({ ...prev, currency: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: PaymentErrors = {};

    // Validate recipient account
    const cleanRecipientAccount = recipientAccount.replace(/\s/g, "");
    if (!cleanRecipientAccount) {
      newErrors.recipientAccount = "Recipient account is required";
    } else if (cleanRecipientAccount.length < 10) {
      newErrors.recipientAccount = "Please enter a valid account number";
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (numAmount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (numAmount > 100000) {
      newErrors.amount = "Amount cannot exceed ₵100,000";
    }

    // Validate currency
    if (!currency) {
      newErrors.currency = "Currency is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await payment.mutateAsync({
        recipient_account: recipientAccount.replace(/\s/g, ""),
        amount: parseFloat(amount),
        currency: currency,
        method: "LINK",
      });

      if (result?.data?.payment_token) {
        setPaymentToken(result.data.payment_token);
        setShowQRCode(true);
      }

      setRecipientAccount("");
      setAmount("");
      setCurrency("GHC");

    } catch (error: any) {
      console.error("Payment submission error:", error);
      showError(error?.response?.data?.message || "Payment failed. Please try again.");
    }
  };

  // Initialize QR Code Scanner
  const initializeScanner = useCallback(() => {
    if (!scannerRef.current) {
      const config = {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log(`QR Code scan result: ${decodedText}`, decodedResult);
        setScanResult(decodedText);
        setIsScanning(false);
        
        // Stop the scanner
        if (scannerRef.current) {
          scannerRef.current.clear().catch(error => {
            console.error("Failed to clear scanner", error);
          });
        }
      };

      const onScanFailure = () => {
        // Handle scan failure - this is called frequently, so we don't log it
        // console.warn(`QR Code scan error: ${error}`);
      };

      try {
        scannerRef.current = new Html5QrcodeScanner(
          scannerElementId,
          config,
          /* verbose= */ false
        );
        
        scannerRef.current.render(onScanSuccess, onScanFailure);
        setIsScanning(true);
      } catch (error) {
        console.error("Error initializing QR scanner:", error);
        showError("Failed to initialize camera. Please make sure you have granted camera permissions.");
      }
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      }).finally(() => {
        scannerRef.current = null;
        setIsScanning(false);
      });
    }
  }, []);

  const handleScannerOpen = async () => {
    setShowScanner(true);
    setScanResult(null);
    // Small delay to ensure the DOM element is rendered
    setTimeout(() => {
      initializeScanner();
    }, 100);
  };

  const handleScannerClose = () => {
    stopScanner();
    setShowScanner(false);
    setScanResult(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner on unmount", error);
        });
      }
    };
  }, []);

  const handleTokenDetected = async (tokenString: string) => {
    // Extract token from QR code data
    let token = tokenString;
    if (tokenString.startsWith('payment-token:')) {
      token = tokenString.replace('payment-token:', '');
    }
    
    // Store the token and show account input modal
    setPendingToken(token);
    setShowAccountInputModal(true);
  };

  const handleAccountSubmit = async () => {
    if (!accountInputValue.trim()) {
      showError('Account number is required to claim payment');
      return;
    }

    if (!pendingToken) {
      showError('Invalid payment token');
      return;
    }

    try {
      // Call the redeem API
     await claimPayment.mutateAsync({ token: pendingToken, account_number: accountInputValue  });
      
      showSuccess('Payment claimed successfully!');
      setShowAccountInputModal(false);
      setAccountInputValue("");
      setPendingToken(null);
      handleScannerClose();
      
    } catch (error: any) {
      console.error('Error claiming payment:', error);
      showError(error?.response?.data?.message || 'Failed to claim payment');
    }
  };

  const generateQRCode = (token: string) => {
    const qrData = `payment-token:${token}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
  };

  const handleQRClose = () => {
    setShowQRCode(false);
    setPaymentToken(null);
  };

  return (
    <AdminLayout title="payment">
      <div className="p-4 min-h-screen">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <Card width="w-full" className="max-w-4xl" height="h-auto">
              <div className="lg:flex lg:items-center lg:gap-8">
                <div className="hidden lg:flex lg:flex-1 lg:justify-center">
                  <div className="w-full max-w-lg">
                    <img
                      src="image_5.jpg"
                      alt="Secure Payment"
                      className="w-full h-auto max-h-[500px] rounded-xl object-cover"
                    />
                  </div>
                </div>

                <div className="w-full lg:flex-1 lg:max-w-2xl">
                  <div className="flex flex-row justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">
                      Send Payment
                    </h2>

                    {/* QR Scanner Button */}
                    <div 
                      onClick={handleScannerOpen}
                      className="min-w-16 min-h-16 sm:min-w-5 sm:min-h-5 bg-gradient-to-br from-indigo-600 rounded-full flex items-center justify-center animate-pulse -mt-3 cursor-pointer hover:from-indigo-700 transition-colors"
                      title="Scan QR Code to claim payment"
                    >
                      <img
                        src="image_7.jpg"
                        alt="qr code scanner"
                        className="w-16 h-16 object-cover opacity-30 rounded-full"
                      />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Recipient Account Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={recipientAccount}
                          onChange={handleRecipientAccountChange}
                          placeholder="9876 5432 1098 7654"
                          maxLength={19}
                          className={`w-full pl-3 pr-10 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.recipientAccount ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                      </div>
                      {errors.recipientAccount && (
                        <p className="text-red-500 text-xs mt-1">{errors.recipientAccount}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={amount}
                          onChange={handleAmountChange}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className={`w-full px-3 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.amount ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                        {errors.amount && (
                          <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={handleCurrencyChange}
                          className={`w-full px-3 py-3 sm:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base transition-colors bg-gray-50 focus:bg-white ${
                            errors.currency ? "border-red-300" : "border-gray-200"
                          }`}
                        >
                          <option value="GHC">GHC (₵)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                        {errors.currency && (
                          <p className="text-red-500 text-xs mt-1">{errors.currency}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-blue-800 font-medium">
                          Payment Link Method
                        </p>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        A secure payment link will be generated that the recipient can use to claim the funds.
                      </p>
                    </div>

                    <Button
                      name="Generate Payment Link"
                      loading={payment.isPending}
                      type="submit"
                      className="w-full bg-blue-600 text-white px-4 py-4 sm:py-5 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transform active:scale-[0.98] touch-manipulation"
                    />
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Scan QR Code
                </h3>
                <button
                  onClick={handleScannerClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">
                Point your camera at a payment QR code to claim the payment
              </p>

              {/* QR Scanner Container */}
              <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4">
                <div id={scannerElementId} className="w-full"></div>
                
                {/* Scanning status indicator */}
                {isScanning && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    SCANNING
                  </div>
                )}
              </div>

              {scanResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-sm font-medium mb-2">
                    QR Code Detected!
                  </p>
                  <p className="text-green-600 text-xs break-all mb-3">
                    {scanResult}
                  </p>
                  <button
                    onClick={() => handleTokenDetected(scanResult)}
                    disabled={claimPayment.isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {claimPayment.isPending ? 'Claiming...' : 'Claim Payment'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Camera className="w-4 h-4" />
                <span className="text-sm">
                  {scanResult ? 'Payment token found' : isScanning ? 'Scanning for QR code...' : 'Initializing camera...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Generation Modal */}
      {showQRCode && paymentToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Token Generated
              </h3>
              <p className="text-gray-600 mb-6">
                Share this QR code with the recipient to claim the payment
              </p>
              
              <div className="flex justify-center mb-6">
                <img
                  src={generateQRCode(paymentToken)}
                  alt="Payment QR Code"
                  className="w-64 h-64 border rounded-xl"
                />
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Payment Token:</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {paymentToken}
                </p>
              </div>
              
              <button
                onClick={handleQRClose}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Input Modal */}
      <Modal
        isOpen={showAccountInputModal}
        onClose={() => {
          setShowAccountInputModal(false);
          setAccountInputValue("");
          setPendingToken(null);
        }}
        title="Enter Account Number"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Enter your account number to claim this payment:
          </p>
          
          <Input
            type="text"
            value={accountInputValue}
            onChange={(e) => setAccountInputValue(e.target.value)}
            placeholder="Enter your account number"
            className="w-full"
          />
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowAccountInputModal(false);
                setAccountInputValue("");
                setPendingToken(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAccountSubmit}
              disabled={claimPayment.isPending || !accountInputValue.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {claimPayment.isPending ? 'Claiming...' : 'Claim Payment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-gray-600 text-center">{errorMessage}</p>
          <button
            onClick={() => setShowErrorModal(false)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-center">{successMessage}</p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            OK
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default Payment;