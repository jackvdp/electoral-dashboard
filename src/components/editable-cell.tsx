import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EditableCellProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function EditableCell({ value, onChange, className }: EditableCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        onChange(editValue);
    };

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBlur();
                    if (e.key === 'Escape') {
                        setEditValue(value);
                        setIsEditing(false);
                    }
                }}
                className={cn("h-8 px-2", className)}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn("cursor-pointer p-2 hover:bg-accent rounded", className)}
        >
            {value}
        </div>
    );
}