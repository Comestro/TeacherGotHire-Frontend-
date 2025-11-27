import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiExclamationCircle, HiCheckCircle, HiInformationCircle, HiXMark } from "react-icons/hi2";

const ErrorMessage = ({
    message,
    type = "error",
    onDismiss,
    className = ""
}) => {
    if (!message) return null;

    const variants = {
        error: {
            bg: "bg-red-50",
            border: "border-red-500",
            text: "text-red-800",
            icon: <HiExclamationCircle className="w-5 h-5 text-red-500" />,
        },
        success: {
            bg: "bg-green-50",
            border: "border-green-500",
            text: "text-green-800",
            icon: <HiCheckCircle className="w-5 h-5 text-green-500" />,
        },
        warning: {
            bg: "bg-yellow-50",
            border: "border-yellow-500",
            text: "text-yellow-800",
            icon: <HiExclamationCircle className="w-5 h-5 text-yellow-500" />,
        },
        info: {
            bg: "bg-blue-50",
            border: "border-blue-500",
            text: "text-blue-800",
            icon: <HiInformationCircle className="w-5 h-5 text-blue-500" />,
        },
    };

    const style = variants[type] || variants.error;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start p-4 mb-4 border-l-4 rounded-r-md shadow-sm ${style.bg} ${style.border} ${className}`}
                role="alert"
            >
                <div className="flex-shrink-0 mt-0.5 mr-3">
                    {style.icon}
                </div>
                <div className={`flex-1 text-sm font-medium ${style.text}`}>
                    {message}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={`flex-shrink-0 ml-3 -mt-0.5 p-1 rounded-full hover:bg-black/5 transition-colors ${style.text}`}
                        aria-label="Dismiss"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default ErrorMessage;
