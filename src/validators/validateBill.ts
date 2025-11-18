import type { tc_Bill, tf_Bill } from "@/types/bill"
import { isDate, isElement, isEmpty, isString } from "lodash"

export const validateBill = (formEntries: tf_Bill) => {
    var validationErrors: any = {};
    
    if (!formEntries.partner_id) {
        validationErrors.partner_id = "you must enter a vendor";
    }

    // if (!formEntries.invoice_date) {
    //     validationErrors.invoice_date = "you must enter a Bill Date"
    // }

    // if (!formEntries.items) {
    //     validationErrors.items[0] ="you must enter an item"
    // }

    
    // const validBill: Partial<tc_Bill> = {}

    // const parnerIdErrors = validateWith(bill.partner_id, [isString, isDate, isElement, isEmpty])
    // if (isString(bill.ref)) {
    //     validBill.ref = bill.ref;
    // } else {

    // }
    


    // return {
    //     isValid:,
    //     errors: {
    //         partner_id: parnerIdErrors,
    //         ref: [],
    //     },
    //     data: validBill,
    // }
    return validationErrors;
}

function validateWith (val: unknown, arrayOfValidationFunctions: ((val :any)=>boolean)[]) {
    var errors: string[]|null = [];
    for (let func of arrayOfValidationFunctions) {
        if (!func(val)) {
            errors.push(`${func.name} failed`);
        }
    }

    if(isEmpty(errors)) errors = null

    return errors
}