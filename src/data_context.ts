export class DataContext<T> {
    private _context: T;
    
    constructor(context: T) {
        this._context = context;
    }
}