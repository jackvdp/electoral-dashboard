import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";

interface EditableTitleProps {
    value: string;
    onUpdate: (value: string) => Promise<void>;
    className?: string;
}

export function EditableTitle({
    value: initialValue,
    onUpdate,
    className = ""
}: EditableTitleProps) {
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSubmit = async () => {
        setIsEditing(false);
        if (value !== initialValue) {
            try {
                await onUpdate(value);
            } catch (error) {
                console.error('Failed to update title:', error);
                setValue(initialValue); // Reset on error
            }
        }
    };

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={e => {
                    if (e.key === 'Enter') handleSubmit();
                    if (e.key === 'Escape') {
                        setValue(initialValue);
                        setIsEditing(false);
                    }
                }}
                className={`max-w-sm ${className}`}
                autoFocus
            />
        );
    }

    return (
        <h2
            className={`text-lg font-semibold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded text-foreground`}
            onClick={() => setIsEditing(true)}
        >
            {value}
        </h2>
    );
}