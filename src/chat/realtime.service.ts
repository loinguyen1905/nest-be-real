import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HelpersService } from "src/helpers/helpers.service";
import { Chat } from "./schemas/chat.shema";
import { UsersService } from '../users/users.service';


@Injectable()
export class ChatService {
    private userId: string;
    private username: string;
    constructor(
        @InjectModel(Chat.name)
        private chatModel: Model<Chat>,
        private readonly helpersService: HelpersService,
        private readonly usersService: UsersService
    ){
    }

    setUser(user_id: string, username: string) {
        this.userId = user_id;
        this.username = username;
    }

    async saveMessage(payload: any) {
        try {
            const chat = payload;
            const message = new this.chatModel(chat);
            console.log(message);
            await message.save();
        } catch (error) {
            this.helpersService.responseError("Cannot save message");
        }
    }

    async getMyChats(user_id: string) {
        try {
            const chats = await this.chatModel.find({
                $or: [
                    { from_id: user_id },
                    { to_id: user_id}
                ],
                deleted: false
            }).sort({ createdAt: "asc"});
            console.log(chats);
            return chats;
        } catch (error) {
            return this.helpersService.responseError(`cannot find chat of user ${user_id}`)
        }
    }

    async getAllFriends(userId: string) {
        try {
            const users = await this.usersService.findAll(userId);
            return users;
        } catch (error) {
            console.log(error);
        }
    }

    async getChatWithId(to_id: string, userId: string) {
        try {
            const otherPerson = await this.usersService.findOne(to_id);
            const chats = await this.chatModel.find({
                $or: [
                    { $and: [ {from_id: to_id}, {to_id: userId} ] },
                    { $and: [ {from_id: userId}, {to_id: to_id} ] }
                ],
                deleted: false
            }).sort({ createdAt: "asc"});
            return {
                chats,
                otherName: otherPerson["userName"]
            };
        } catch (error) {
            return this.helpersService.responseError(`Cannot get chats with friend id ${to_id} !`);
        }
    }

    async getChatGlobal(userId: string) {
        try {
            return [];
        } catch (error) {
            return this.helpersService.responseError("cannor get chat global before !");
        }
    }
}