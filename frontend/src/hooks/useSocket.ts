"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";

export interface SocketEvents {
  onBookingUpdated?: (data: { bookingId: string; [key: string]: any }) => void;
  onNotification?: (notification: any) => void;
  onMechanicLocationUpdated?: (data: { mechanicId: string; latitude: number; longitude: number }) => void;
}

export function useSocket(events: SocketEvents = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket: Socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join", { room: "ops_dashboard" });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    if (events.onBookingUpdated) {
      socket.on("booking.updated", events.onBookingUpdated);
    }

    if (events.onNotification) {
      socket.on("notification", events.onNotification);
    }

    if (events.onMechanicLocationUpdated) {
      socket.on("mechanic.location.updated", events.onMechanicLocationUpdated);
    }

    return () => {
      if (events.onBookingUpdated) socket.off("booking.updated", events.onBookingUpdated);
      if (events.onNotification) socket.off("notification", events.onNotification);
      if (events.onMechanicLocationUpdated) socket.off("mechanic.location.updated", events.onMechanicLocationUpdated);
      socket.disconnect();
    };
  }, []);

  return { isConnected, socket: socketRef.current };
}
