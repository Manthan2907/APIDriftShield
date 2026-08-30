import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="h-24 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-2xl border border-gray-200"
          animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />
      ))}
    </motion.div>
  );
}

export default LoadingSkeleton;
