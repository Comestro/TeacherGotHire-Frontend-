import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiUrl } from "../../store/configue";
import useRazorpay from "react-razorpay";
import { FaWallet, FaCoins, FaHistory } from "react-icons/fa";
import { toast } from "react-toastify";

const WalletDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pointsToBuy, setPointsToBuy] = useState("");
  const [Razorpay] = useRazorpay();

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem("token");
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

    try {
      const token = localStorage.getItem("token");
      
      // Create order
      const orderRes = await axios.post(
        `${getApiUrl()}/api/wallet/create-order/`,
        { points: pointsToBuy },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      const { order_id, amount, currency, key_id } = orderRes.data;

      // Initialize Razorpay
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
          }
        },
        prefill: {
          name: "User",
        },
        theme: {
          color: "#0d9488",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error", error);
      toast.error("Failed to initiate payment.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading wallet details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaWallet className="text-teal-600" /> My Wallet
        </h2>
        <div className="bg-teal-50 text-teal-700 px-6 py-3 rounded-xl border border-teal-200 flex items-center gap-3">
          <FaCoins className="text-2xl" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide opacity-80">Available Balance</p>
            <p className="text-2xl font-black">{wallet?.balance || 0} Points</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Buy Points Section */}
        <div className="bg-gray-50 p-6 rounded-xl border">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Recharge Wallet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Buy points to unlock premium features, send hire requests, and apply for verified jobs.
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Points to Buy</label>
            <input
              type="number"
              value={pointsToBuy}
              onChange={(e) => setPointsToBuy(e.target.value)}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. 100"
              min="1"
            />
            {pointsToBuy && (
              <p className="text-xs text-green-600 font-bold mt-2">
                Total Cost: ₹{(pointsToBuy * (config?.point_price_in_inr || 1)).toFixed(2)}
              </p>
            )}
          </div>
          
          <button
            onClick={handleBuyPoints}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-95"
          >
            Buy Points with Razorpay
          </button>
        </div>

        {/* Transaction History Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaHistory className="text-gray-400" /> Transaction History
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {wallet?.transactions?.length > 0 ? (
              [...wallet.transactions].reverse().map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <div className={`font-bold ${tx.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.transaction_type === 'CREDIT' ? '+' : '-'}{tx.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-gray-400 border rounded-lg border-dashed">
                No transactions yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
