import React, { useEffect, useState } from "react";

// FULL PWA-READY FGC TRAIN TRACKER
// Includes:
// - Auto refresh
// - Countdown timer
// - Notifications
// - Ready to plug into PWA (manifest + service worker needed externally)

const API_URL = "https://dadesobertes.fgc.cat/api/explore/v2.1/catalog/datasets/temps-pas-estacions/records";

export default function FGCWidget() {
  const [station, setStation] = useState("PLAÇA CATALUNYA");
  const [trains, setTrains] = useState([]);
  const [nextTrain, setNextTrain] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // طلب permiso notificaciones
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const notify = (msg) => {
    if (Notification.permission === "granted") {
      new Notification(msg);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${API_URL}?where=estacio=\"${station}\"&limit=10`
      );
      const data = await res.json();
      const results = data.results || [];

      setTrains(results);

      if (results.length) {
        const sorted = results.sort(
          (a, b) => a.temps_arribada - b.temps_arribada
        );

        const next = sorted[0];

        // Detect train change
        if (nextTrain && nextTrain.id !== next.id) {
          notify("El tren anterior ya se fue. Nuevo tren cargado");
        }

        setNextTrain(next);
        setCountdown(next.temps_arribada);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch cada 15s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [station]);

  // Countdown cada minuto
  useEffect(() => {
    if (countdown === null) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Notificación inteligente
  useEffect(() => {
    if (countdown === 3) {
      notify("Sal ya: tren en 3 minutos");
    }
  }, [countdown]);

  return (
    <div className="p-4 rounded-2xl shadow-xl bg-white max-w-sm">
      <h2 className="text-xl font-bold mb-3">FGC Tracker</h2>

}
