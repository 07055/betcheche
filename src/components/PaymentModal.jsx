import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PaystackButton } from 'react-paystack';
import { config } from '../config';

export default function PaymentModal({ onClose }) {
    const [mode, setMode] = useState('deposit');
    const [amount, setAmount] = useState(1000);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useGameStore();
    const balance = useGameStore(s => s.balance);
    const currency = useGameStore(s => s.currency);
    const deposit = useGameStore(s => s.deposit);
    const withdraw = useGameStore(s => s.withdraw);
    const addTransaction = useGameStore(s => s.addTransaction);

    const configPaystack = {
        reference: (new Date()).getTime().toString(),
        email: email || (user?.username ? `${user.username}@aviator.com` : "customer@example.com"),
        amount: amount * 100, // Paystack expects kobo/cents
        publicKey: config.PAYSTACK_PUBLIC_KEY,
        currency: currency,
    };

    const handlePaystackSuccessAction = (reference) => {
        deposit(amount);
        addTransaction({
            id: reference.reference,
            type: 'deposit',
            amount,
            status: 'success',
            date: new Date().toISOString()
        });
        setLoading(false);
        onClose();
    };

    const handlePaystackCloseAction = () => {
        setLoading(false);
    };

    const handleAction = async () => {
        if (mode === 'withdraw') {
            setLoading(true);
            await new Promise(r => setTimeout(r, 1000));
            if (balance >= amount) {
                withdraw(amount);
                addTransaction({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'withdrawal',
                    amount,
                    status: 'success',
                    date: new Date().toISOString()
                });
            }
            setLoading(false);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="payment-modal"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
            >
                <div className="payment-tabs">
                    <button
                        className={`pay-tab ${mode === 'deposit' ? 'active' : ''}`}
                        onClick={() => setMode('deposit')}
                    >
                        DEPOSIT
                    </button>
                    <button
                        className={`pay-tab ${mode === 'withdraw' ? 'active' : ''}`}
                        onClick={() => setMode('withdraw')}
                    >
                        WITHDRAW
                    </button>
                </div>

                <div className="payment-body">
                    <h3>{mode === 'deposit' ? 'Add Funds' : 'Cash Out Funds'}</h3>
                    <p className="payment-subtitle">Secure payment via <b>Paystack</b></p>

                    <div className="amount-input-group">
                        <span className="cur">{currency}</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                        />
                    </div>

                    <div className="amount-presets">
                        {[500, 1000, 2000, 5000].map(val => (
                            <button key={val} onClick={() => setAmount(val)}>
                                {currency === 'KES' ? 'K' : '$'}{val}
                            </button>
                        ))}
                    </div>

                    {mode === 'deposit' && (
                        <div className="email-input-group">
                            <input
                                type="email"
                                placeholder="Enter receipt email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="email-field"
                            />
                        </div>
                    )}

                    {mode === 'deposit' ? (
                        <PaystackButton
                            className="pay-submit-btn deposit"
                            {...configPaystack}
                            text={loading ? 'Processing...' : 'DEPOSIT NOW'}
                            onSuccess={handlePaystackSuccessAction}
                            onClose={handlePaystackCloseAction}
                            onClick={() => setLoading(true)}
                            disabled={!email.includes('@') || !email.includes('.') || loading}
                        />
                    ) : (
                        <button
                            className="pay-submit-btn withdraw"
                            onClick={handleAction}
                            disabled={loading || (mode === 'withdraw' && amount > balance)}
                        >
                            {loading ? 'Processing...' : 'WITHDRAW NOW'}
                        </button>
                    )}
                </div>

                <button className="modal-close-btn" onClick={onClose}>×</button>
            </motion.div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
                }
                .payment-modal {
                    background: #1a1a1a;
                    width: 380px;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                    position: relative;
                }
                .payment-tabs {
                    display: flex;
                    background: #111;
                }
                .pay-tab {
                    flex: 1;
                    background: none;
                    border: none;
                    color: #777;
                    padding: 16px;
                    font-weight: 800;
                    font-size: 13px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                }
                .pay-tab.active {
                    color: #fff;
                    background: #1a1a1a;
                    border-bottom-color: #e11d48;
                }
                .payment-body {
                    padding: 30px;
                    text-align: center;
                }
                h3 { margin: 0; font-size: 20px; color: #fff; }
                .payment-subtitle { color: #666; font-size: 13px; margin: 8px 0 24px 0; }
                .amount-input-group {
                    background: #000;
                    border: 1px solid #333;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    padding: 10px 20px;
                    margin-bottom: 20px;
                }
                .cur { color: #e11d48; font-weight: 800; font-size: 18px; margin-right: 12px; }
                .email-input-group {
                    margin-bottom: 20px;
                }
                .email-field {
                    background: #000;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 12px 15px;
                    color: #fff;
                    width: 100%;
                    font-size: 14px;
                    text-align: center;
                    outline: none;
                }
                .email-field:focus {
                    border-color: #e11d48;
                }
                input {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 24px;
                    font-weight: 800;
                    width: 100%;
                    outline: none;
                }
                .amount-presets {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 30px;
                }
                .amount-presets button {
                    background: #2a2a2a;
                    border: none;
                    border-radius: 8px;
                    color: #ccc;
                    padding: 10px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .pay-submit-btn {
                    width: 100%;
                    padding: 16px;
                    border-radius: 12px;
                    border: none;
                    color: #fff;
                    font-weight: 900;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }
                .pay-submit-btn.deposit { background: #28a745; }
                .pay-submit-btn.withdraw { background: #eab308; color: #000; }
                .pay-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .modal-close-btn {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: #555;
                    font-size: 28px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
