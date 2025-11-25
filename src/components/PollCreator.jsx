import { useState } from 'react';
import { BarChart, Plus, X } from 'lucide-react';
import { Button, Input } from './ui';
import { createPoll } from '../lib/pollUtils';

const PollCreator = ({ onSend, onCancel }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCreate = () => {
        if (!question.trim()) {
            alert('Lütfen bir soru girin');
            return;
        }

        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            alert('En az 2 seçenek gerekli');
            return;
        }

        const poll = createPoll(question, validOptions);
        onSend({
            type: 'poll',
            poll
        });
    };

    return (
        <div className="p-4 bg-dark-surface border-t border-dark-border max-h-[400px] overflow-y-auto">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart size={20} className="text-primary" />
                Anket Oluştur
            </h3>

            <div className="space-y-3">
                <Input
                    placeholder="Soru..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="font-medium"
                />

                <div className="space-y-2">
                    {options.map((opt, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder={`Seçenek ${index + 1}`}
                                value={opt}
                                onChange={(e) => updateOption(index, e.target.value)}
                            />
                            {options.length > 2 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => removeOption(index)}
                                    className="px-2"
                                >
                                    <X size={16} />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {options.length < 10 && (
                    <Button onClick={addOption} variant="secondary" className="w-full">
                        <Plus size={16} className="mr-2" />
                        Seçenek Ekle
                    </Button>
                )}

                <div className="flex gap-2 pt-2">
                    <Button onClick={handleCreate} className="flex-1">
                        Anketi Gönder
                    </Button>
                    <Button onClick={onCancel} variant="ghost">
                        İptal
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PollCreator;
