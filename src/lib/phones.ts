export class Phones {

    public clean(phoneNumber: string): string {
        if (!phoneNumber) {
            return '';
        }
        // remove + and/or 1 from beginning
        if (phoneNumber[0] === '+') {
            phoneNumber = phoneNumber.substring(1);
        }
        if (phoneNumber[0] === '1') {
            phoneNumber = phoneNumber.substring(1);
        }
        return phoneNumber.replace(/\D/g, '').substring(0, 10);
    }

    public format(phoneNumber: string): string {
        phoneNumber = this.clean(phoneNumber);
        let num;
        if (phoneNumber.length < 3) {
            num = `(${phoneNumber}`;
        } else if (phoneNumber.length < 6) {
            num = `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3, 5)}`;
        } else {
            num = `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6, 10)}`;
        }
        return num;
    }
}

export default new Phones();
