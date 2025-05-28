import messages from '../middleware/Message';
import { Request, Response, NextFunction } from 'express';

interface RequestWithMessages extends Request {
    messages?: Record<string, string>;
}

const languageMiddleware = (req: RequestWithMessages, res: Response, next: NextFunction): void => {
let langHeader = req.headers['language'];
let lang: string;

if (Array.isArray(langHeader)) {
    lang = langHeader[0] || 'en';
} else if (typeof langHeader === 'string') {
    lang = langHeader.split(',')[0] || 'en';
} else {
    lang = 'en';
}
req.messages = messages[lang] || messages['en'];

    // Debugging logs
    console.log(lang, "Detected Language");
    console.log(req.messages, "Assigned Messages");

    next();
};

export default languageMiddleware;
