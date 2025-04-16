"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

interface UserConnectionQRProps {
  userId: string;
  userName: string;
}

export function UserConnectionQR({ userId, userName }: UserConnectionQRProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/users/connection-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code");
      }

      setQrCode(data.qrCode);
      setExpiresAt(new Date(data.expiresAt));
      setIsOpen(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const formatExpiryTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={generateQRCode} 
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Mobile Connection QR"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mobile Connection QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code with the mobile app to connect {userName}'s account.
            This code will expire after one use or at {expiresAt ? formatExpiryTime(expiresAt) : "1 hour"}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          {qrCode && (
            <div className="flex flex-col items-center gap-4">
              <div className="border border-gray-200 rounded-md p-2 bg-white">
                <Image 
                  src={qrCode} 
                  alt="Connection QR Code" 
                  width={250} 
                  height={250}
                  className="w-[250px] h-[250px]"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This QR code will expire after one use or in 1 hour
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
          <Button
            variant="default"
            onClick={generateQRCode}
            disabled={isLoading}
          >
            Generate New Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
