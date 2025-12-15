import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from './ui/button';
import { useAllResource } from '@/hooks/useResource';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import type { Contact } from '@/types/contact';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SearchableSelect({value, setValue}:{value: any, setValue: Function, data?: any}) { // the value is the id stringified
    const [open, setOpen] = useState(false)
    const {data: contacts, isLoading: isContactsLoading, isError: isContactsError}= useAllResource('contact')
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                {value
                    ? contacts && contacts.find((contact: Contact) => String(contact.id) === value)?.name
                    : `Select Client...`}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search Client..." />
                    <CommandList>
                        <CommandEmpty>No Client found.</CommandEmpty>
                        <CommandGroup>
                            {contacts && contacts.map((contact: Contact) => (
                                <CommandItem
                                    key={contact.id}
                                    value={contact.name}   // 👈 searchable name
                                    onSelect={(currentValue) => {
                                        // dispatch(setCellValue({row: r+1, col: c, value: String(contact.id ||'') }))
                                        setValue(currentValue === value ? "" : String(contact.id))
                                        setOpen(false)
                                    }}
                                >
                                    <CheckIcon
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === String(contact.id) ? "opacity-100" : "opacity-0"
                                    )}
                                    />
                                    {contact.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
