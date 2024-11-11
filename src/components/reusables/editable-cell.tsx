import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";

export interface EditableCellProps {
    value: string;
    onUpdate: (value: string) => void;
}

export function EditableCell({
    value: initialValue,
    onUpdate,
}: EditableCellProps) {
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onBlur = () => {
        setIsEditing(false);
        if (value !== initialValue) {
            onUpdate(value);
        }
    };

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
                autoFocus
                className="h-8 w-full"
            />
        );
    }

    return (
        <div
            className="h-full w-full cursor-pointer p-2 hover:bg-muted/50"
            onClick={() => setIsEditing(true)}
        >
            {value}
        </div>
    );
}