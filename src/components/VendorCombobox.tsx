"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Contact } from "@/types/contact"
import { useAllResource } from "@/hooks/useResource"

// const vendors = contacts.map((v: Contact)=>(
//   {
//     value: v.id,
//     label: v.name,
//   }
// ))

export function VendorCombobox() {
    const {data: contacts, isLoading: isContactsLoading, isError: isContactsError}= useAllResource('contact')

    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

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
                ? contacts.find((contact: Contact) => String(contact.id) === String(value))?.label
                : "Select Vendor..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
            <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
                <CommandEmpty>No Vendor found.</CommandEmpty>
                <CommandGroup>
                {contacts.map((contact: Contact) => (
                    <CommandItem
                    key={contact.id}
                    value={String(contact.id)}
                    onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
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