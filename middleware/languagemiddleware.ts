import messages from '../middleware/Message';
import { Request, Response, NextFunction } from 'express';

interface RequestWithMessages extends Request {
    messages?: Record<string, string>;
}

const languageMiddleware = (req: RequestWithMessages, res: Response, next: NextFunction): void => {
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';
    req.messages = messages[lang] || messages['en'];

    // Debugging logs
    console.log(lang, "Detected Language");
    console.log(req.messages, "Assigned Messages");

    next();
};

export default languageMiddleware;
