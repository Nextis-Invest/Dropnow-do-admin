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

interface ExternalUserConnectionQRProps {
  initialExternalId?: string;
}

export function ExternalUserConnectionQR({
  initialExternalId,
}: ExternalUserConnectionQRProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [connectionToken, setConnectionToken] = useState<string | null>(null);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/external-users/connection-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate QR code");
      }

      setQrCode(result.qrCode);
      setExpiresAt(new Date(result.expiresAt));
      setConnectionToken(result.token);
      setIsOpen(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const formatExpiryTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-center">
        <h3 className="text-lg font-medium mb-4">
          Generate Driver Access QR Code
        </h3>
        <p className="text-muted-foreground mb-6">
          Generate a QR code that drivers can scan with the mobile app to access
          their rides. When a driver scans the code, they will be able to send
          their information and connect to the platform.
        </p>
        <Button onClick={generateQRCode} disabled={isLoading} size="lg">
          {isLoading ? "Generating..." : "Generate QR Code"}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Driver Access QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code with the mobile app to give the driver access to
              their rides. This code will expire after one use or at{" "}
              {expiresAt ? formatExpiryTime(expiresAt) : "1 hour"}.
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
                {connectionToken && (
                  <div className="text-sm text-center">
                    <p className="font-medium">
                      Token ID: {connectionToken.substring(0, 8)}...
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  This QR code will expire after one use or in 1 hour
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
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
    </div>
  );
}
