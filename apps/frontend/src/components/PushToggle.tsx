import React, { useEffect, useState } from 'react';
import { useGetPushPublicKeyQuery, useSubscribeToPushMutation, useUnsubscribeFromPushMutation } from '../store/api/apiSlice';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const PushToggle: React.FC = () => {
    const { data: keyData } = useGetPushPublicKeyQuery(undefined);
    const [subscribeToPush, { isLoading: isSubscribing }] = useSubscribeToPushMutation();
    const [unsubscribeFromPush, { isLoading: isUnsubscribing }] = useUnsubscribeFromPushMutation();
    const [enabled, setEnabled] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
            const reg = await navigator.serviceWorker.getRegistration();
            const sub = await reg?.pushManager.getSubscription();
            setEnabled(!!sub);
        })();
    }, []);

    const handleEnable = async () => {
        if (!keyData?.publicKey) {
            alert('Push not available');
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
            setEnabled(true);
            return;
        }

        const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        });

        await subscribeToPush({
            endpoint: sub.endpoint,
            keys: {
                p256dh: (sub.toJSON() as any).keys.p256dh,
                auth: (sub.toJSON() as any).keys.auth,
            },
        }).unwrap();

        setEnabled(true);
    };

    const handleDisable = async () => {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
            // Inform backend with endpoint to delete
            try {
                await unsubscribeFromPush({ endpoint: sub.endpoint } as any).unwrap();
            } catch {
                // ignore
            }
            await sub.unsubscribe();
        }
        setEnabled(false);
    };

    return (
        <button
            className="cta-button secondary"
            onClick={enabled ? handleDisable : handleEnable}
            disabled={isSubscribing || isUnsubscribing}
        >
            {enabled ? 'Disable Notifications' : 'Enable Notifications'}
        </button>
    );
};

export default PushToggle;


