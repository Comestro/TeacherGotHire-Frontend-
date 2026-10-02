import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../../store/configue";
import { FaWallet, FaCoins, FaHistory } from "react-icons/fa";
import { HiOutlineLightningBolt, HiOutlineRefresh } from "react-icons/hi";
import { HiMiniArrowsRightLeft } from "react-icons/hi2";
import { toast } from "react-toastify";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const WalletDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pointsToBuy, setPointsToBuy] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${getApiUrl()}/api/wallet/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setWallet(res.data.wallet);
      setConfig(res.data.config);
    } catch (error) {
      console.error("Error fetching wallet", error);
      toast.error("Failed to load wallet details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleBuyPoints = async () => {
    if (!pointsToBuy || parseInt(pointsToBuy) <= 0) {
      toast.error("Please enter a valid number of points.");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("access_token");
      
      // Create order
      const orderRes = await axios.post(
        `${getApiUrl()}/api/wallet/create-order/`,
        { points: pointsToBuy },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      const { order_id, amount, currency, key_id } = orderRes.data;

      // Initialize Razorpay
      const res = await loadRazorpayScript();

      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "PTPI Points",
        description: `Purchase of ${pointsToBuy} Points`,
        order_id: order_id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${getApiUrl()}/api/wallet/verify-payment/`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Token ${token}` } }
            );
            toast.success("Points successfully added to your wallet!");
            setPointsToBuy("");
            fetchWallet(); // Refresh balance
          } catch (verifyError) {
            toast.error("Payment verification failed.");
            console.error(verifyError);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "User",
        },
        theme: {
          color: "#0f766e",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error("Payment Failed! Please try again.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Payment error", error);
      toast.error("Failed to initiate payment.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center">
        <HiOutlineRefresh className="text-4xl text-slate-300 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading wallet details...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          My Wallet
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your points, recharge your balance, and view transaction history.
        </p>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Balance & Recharge (Spans 2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Balance Card */}
          <div className="bg-slate-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden border border-slate-800">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Available Balance</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black tracking-tight">{wallet?.balance || 0}</span>
                  <span className="text-xl font-bold text-teal-400">Points</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 backdrop-blur-sm">
                <HiOutlineLightningBolt className="text-teal-400 text-lg" />
                <span>1 Point = ₹{config?.point_price_in_inr || 1}</span>
              </div>
            </div>
          </div>

          {/* Recharge Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Recharge Wallet</h3>
            <p className="text-sm text-slate-500 mb-6">
              Buy points to unlock premium features, send hire requests, and apply for verified jobs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Number of Points
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pointsToBuy}
                    onChange={(e) => setPointsToBuy(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow bg-slate-50"
                    placeholder="Enter points (e.g. 100)"
                    min="1"
                    disabled={isProcessing}
                  />
                </div>
                {pointsToBuy && parseInt(pointsToBuy) > 0 && (
                  <p className="text-sm text-teal-700 font-medium mt-2 flex items-center gap-1.5 bg-teal-50 inline-block px-3 py-1 rounded-md">
                    Total Cost: <span className="font-bold">₹{(pointsToBuy * (config?.point_price_in_inr || 1)).toFixed(2)}</span>
                  </p>
                )}
              </div>
              
              <button
                onClick={handleBuyPoints}
                disabled={isProcessing || !pointsToBuy || parseInt(pointsToBuy) <= 0}
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3 px-8 rounded-xl transition-colors whitespace-nowrap"
              >
                {isProcessing ? "Processing..." : "Proceed to Pay"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
              <HiMiniArrowsRightLeft className="text-slate-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Transaction History</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[500px] p-2 custom-scrollbar">
            {wallet?.transactions?.length > 0 ? (
              <div className="space-y-1">
                {[...wallet.transactions].reverse().map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                        {tx.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`text-base font-bold whitespace-nowrap ${
                      tx.transaction_type === 'CREDIT' 
                        ? 'text-teal-600' 
                        : 'text-red-500'
                    }`}>
                      {tx.transaction_type === 'CREDIT' ? '+' : '-'}{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
                <FaHistory className="text-4xl text-slate-200 mb-3" />
                <p className="text-sm">No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default WalletDashboard;
