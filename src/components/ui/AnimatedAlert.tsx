import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AnimatedAlertProps {
  type?: "error" | "warning" | "success" | "info";
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function AnimatedAlert({
  type = "info",
  title,
  description,
  children,
  className = "",
}: AnimatedAlertProps) {
  const variants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const typeConfig = {
    error: {
      bg: "bg-red-50/90",
      border: "border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-600",
      titleColor: "text-red-950",
      descColor: "text-red-800",
    },
    warning: {
      bg: "bg-amber-50/90",
      border: "border-amber-200",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      titleColor: "text-amber-950",
      descColor: "text-amber-800",
    },
    success: {
      bg: "bg-emerald-50/90",
      border: "border-emerald-200",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-950",
      descColor: "text-emerald-800",
    },
    info: {
      bg: "bg-blue-50/90",
      border: "border-blue-200",
      icon: Info,
      iconColor: "text-blue-600",
      titleColor: "text-blue-950",
      descColor: "text-blue-800",
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={`${config.bg} border ${config.border} rounded-2xl p-4 flex items-start gap-3.5 shadow-xs ${className}`}
    >
      <motion.div whileHover={{ scale: 1.1 }} className="flex-shrink-0 mt-0.5">
        <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
      </motion.div>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={`font-bold text-xs sm:text-sm ${config.titleColor} mb-0.5`}>
            {title}
          </h3>
        )}
        {description && (
          <p className={`text-xs ${config.descColor} leading-relaxed`}>{description}</p>
        )}
        {children && <div className={`text-xs ${config.descColor} mt-2`}>{children}</div>}
      </div>
    </motion.div>
  );
}

export default AnimatedAlert;
