"use client";

import { Box, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCheckTaskSessionExists, useCreateTaskSession } from "@/hooks/api/useTaskSession";
import { use, useEffect, useState } from "react";

const checklistCard = [
    {
        type: "Daily Checklist",
        description: "ตรวจสอบงานประจำวันเพื่อความเรียบร้อยและประสิทธิภาพในการทำงาน",
        icon: CalendarTodayIcon,
        id: "DAILY",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#667eea",
    },
    {
        type: "Weekly Checklist",
        description: "ตรวจสอบงานประจำสัปดาห์เพื่อความเรียบร้อยและประสิทธิภาพในการทำงาน",
        icon: DateRangeIcon,
        id: "WEEKLY",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        color: "#f093fb",
    },
    {
        type: "Monthly Checklist",
        description: "ตรวจสอบงานประจำเดือนเพื่อความเรียบร้อยและประสิทธิภาพในการทำงาน",
        icon: EventNoteIcon,
        id: "MONTHLY",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        color: "#4facfe",
    }
];

export default function ChecklistsCardPage() {
    const router = useRouter();

    const handleCardClick = (id: string) => {
        router.push(`/checklists/${id.toLowerCase()}`);
    };

    return (
        <Box sx={{ width: "100%", py: 2 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 700,
                        mb: 1,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Checklists
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    เลือกประเภท Checklist ที่คุณต้องการตรวจสอบ
                </Typography>
            </Box>

            {/* Cards Grid */}
            <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 3,
            }}>
                {checklistCard.map((card) => {
                    const IconComponent = card.icon;
                    return (
                        <Paper
                            key={card.id}
                            elevation={0}
                            onClick={() => handleCardClick(card.id)}
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                cursor: "pointer",
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                height: "100%",
                                minHeight: 240,
                                background: (theme) => theme.palette.mode === "dark" 
                                    ? "rgba(255, 255, 255, 0.05)" 
                                    : "#fff",
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                                    borderColor: card.color,
                                    "& .icon-box": {
                                        transform: "scale(1.1) rotate(5deg)",
                                    },
                                    "& .arrow-icon": {
                                        transform: "translateX(8px)",
                                        opacity: 1,
                                    }
                                },
                            }}
                        >
                            {/* Gradient Background Decoration */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: -50,
                                    right: -50,
                                    width: 200,
                                    height: 200,
                                    background: card.gradient,
                                    borderRadius: "50%",
                                    opacity: 0.1,
                                    transition: "all 0.3s ease",
                                }}
                            />

                            {/* Content */}
                            <Box sx={{ 
                                position: "relative", 
                                zIndex: 1, 
                                p: 3,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}>
                                {/* Icon */}
                                <Box
                                    className="icon-box"
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: 3,
                                        background: card.gradient,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mb: 3,
                                        transition: "all 0.3s ease",
                                        boxShadow: `0 8px 24px ${card.color}40`,
                                    }}
                                >
                                    <IconComponent 
                                        sx={{ 
                                            fontSize: 36, 
                                            color: "#fff",
                                        }}
                                    />
                                </Box>

                                {/* Title */}
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontWeight: 600,
                                        mb: 1.5,
                                        fontSize: "1.25rem",
                                    }}
                                >
                                    {card.type}
                                </Typography>

                                {/* Description */}
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        mb: 3,
                                        lineHeight: 1.6,
                                        flex: 1,
                                    }}
                                >
                                    {card.description}
                                </Typography>

                                {/* Arrow Icon */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: card.color,
                                            fontWeight: 600,
                                        }}
                                    >
                                        เริ่มใช้งาน
                                    </Typography>
                                    <ArrowForwardIcon 
                                        className="arrow-icon"
                                        sx={{ 
                                            fontSize: 18,
                                            color: card.color,
                                            transition: "all 0.3s ease",
                                            opacity: 0.7,
                                        }} 
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>
        </Box>
    );
}