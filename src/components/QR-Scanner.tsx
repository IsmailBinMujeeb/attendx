import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { DrawerComponent } from "@/components/Drawer";
import { ScanQrCode } from "lucide-react";
import { BadgeCheck } from "@/components/animate-ui/icons/badge-check";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanDone, setScanDone] = useState(false);

  const startScanner = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scannerRef.current) return;

        const html5Qrcode = new Html5Qrcode("reader");
        scannerRef.current = html5Qrcode;

        html5Qrcode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          (e) => {
            console.log(e);
          },
        );
      });
    });
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
      setScanDone(true);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <DrawerComponent
      title="Scan QR Code"
      description="Scan QR code"
      onOpen={startScanner}
      onClose={stopScanner}
      buttonIcon={<ScanQrCode />}
      buttonVariant={"ghost"}
    >
      {scanDone ? (
        <div>
          <BadgeCheck animateOnViewOnce className="text-green-500" size={62} />
        </div>
      ) : (
        <div id="reader" style={{ width: "300px" }} />
      )}
    </DrawerComponent>
  );
}
