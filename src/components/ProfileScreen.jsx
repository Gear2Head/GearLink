import { useState } from 'react';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Button, Avatar, Input } from './ui';
import { ArrowLeft, Camera, Loader2, Save, Settings } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getFirebaseStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfileScreen = ({ onBack, onShowSettings }) => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const storage = getFirebaseStorage();
    const user = auth.currentUser;

    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [bio, setBio] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [photoURL, setPhotoURL] = useState(user.photoURL);
    const [loaded, setLoaded] = useState(false);

    // Load bio from Firestore
    if (!loaded) {
        getDoc(doc(db, 'users', user.uid)).then(docSnap => {
            if (docSnap.exists()) {
                setBio(docSnap.data().bio || '');
            }
            setLoaded(true);
        });
    }

    const handlePhotoChange = async () => {
        setUploading(true);
        try {
            const image = await CapacitorCamera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.Uri,
                source: CameraSource.Prompt
            });

            const response = await fetch(image.webPath);
            const blob = await response.blob();

            const storageRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);

            await updateProfile(user, { photoURL: url });
            await updateDoc(doc(db, 'users', user.uid), { photoURL: url });

            setPhotoURL(url);
            alert('Profil fotoğrafı güncellendi!');
        } catch (error) {
            if (error.message !== 'User cancelled photos app') {
                alert('Fotoğraf yüklenemedi: ' + error.message);
            }
        }
        setUploading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(user, { displayName });
            await updateDoc(doc(db, 'users', user.uid), {
                displayName,
                bio
            });
            alert('Profil kaydedildi!');
            onBack();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
        setSaving(false);
    };

    return (
        <div className="h-screen flex flex-col bg-dark-bg">
            {/* Header */}
            <div className="p-4 border-b border-dark-border bg-dark-surface flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} className="rounded-full w-10 h-10 p-0">
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-xl font-semibold">Profil Düzenle</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Photo */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar
                                src={photoURL}
                                fallback={displayName?.[0] || user.email[0]}
                                className="w-32 h-32 text-4xl bg-primary/20"
                            />
                            <button
                                onClick={handlePhotoChange}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-3 hover:bg-primary-hover"
                            >
                                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                            </button>
                        </div>
                        <p className="text-sm text-gray-400">Fotoğrafını değiştirmek için tıkla</p>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">İsim</label>
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="İsmini gir"
                            className="w-full"
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Hakkında</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Hakkında bir şeyler yaz..."
                            className="w-full px-4 py-2 bg-dark-surface text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                            maxLength={150}
                        />
                        <p className="text-xs text-gray-400">{bio.length}/150</p>
                    </div>

                    {/* Email (readonly) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">E-posta</label>
                        <Input
                            value={user.email}
                            disabled
                            className="w-full opacity-60"
                        />
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={saving || !displayName.trim()}
                        className="w-full bg-primary hover:bg-primary-hover"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" size={20} />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2" size={20} />
                                Kaydet
                            </>
                        )}
                    </Button>

                    {/* Settings Button */}
                    {onShowSettings && (
                        <Button
                            onClick={onShowSettings}
                            variant="outline"
                            className="w-full"
                        >
                            <Settings className="mr-2" size={20} />
                            Ayarlar
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
