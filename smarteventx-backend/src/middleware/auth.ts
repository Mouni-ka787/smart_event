import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: string };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('User found in database:', user);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid. User not found.' });
    }
    
    req.user = user as IUser & { _id: string };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid. Authentication failed.' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    console.log('User role:', req.user.role);
    console.log('Required roles:', roles);
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User not authorized. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }
    
    next();
  };
};