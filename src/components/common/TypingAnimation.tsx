import { Box } from "@mui/material";
import { motion } from "framer-motion";

const TypingAnimation = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 2 }}>
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0.3, y: 0 }}
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'gray',
                }}
            />
        ))}
    </Box>
);

export default TypingAnimation;