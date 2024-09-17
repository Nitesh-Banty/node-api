import mongoose, { Schema, Document, Model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { promises } from 'dns';


interface IWatchHistory {
    videoId: mongoose.Types.ObjectId;
}

export interface IUser extends Document {
    username: string;
    fullName: string;
    avatar: string;
    coverImage?: string;
    watchHistory: IWatchHistory[];
    password: string;
    refreshToken?: string;
    email: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const watchHistorySchema = new Schema<IWatchHistory>({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
    }
});

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [watchHistorySchema],
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// WE CAN INJECT METHOD LIKE THIS IN OUT SCHEMA 
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

//GET ACCESS TOKEN 
UserSchema.methods.generateAccessToken = async function () {
    const payload: jwt.JwtPayload = {
        _id: this._id,
        email: this.email,
        userName: this.username,
        fullName: this.fullName
    };

    const secret: jwt.Secret = process.env.ACCESS_TOKEN_SECRET!;

    const options: jwt.SignOptions = {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    };

    return jwt.sign(payload, secret, options);
};

UserSchema.methods.generateRefreshToken = async function () {
    const payload: jwt.JwtPayload = {
        _id: this._id
    };

    const secret: jwt.Secret = process.env.REFRESH_TOKEN_SECRET!;

    const options: jwt.SignOptions = {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    };

    return jwt.sign(payload, secret, options);
};



// UserSchema.plugin(mongooseAggregatePaginate);

// interface UserModel extends Model<IUser> {
//     aggregatePaginate: any; // You might want to type this properly if you have type definitions for mongoose-aggregate-paginate-v2
// }

export default mongoose.model<IUser>('User', UserSchema);