import { boundMethod } from 'autobind-decorator';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import { ITodoRequest } from '../controller';
import CommentService from './service';

@injectable()
export default class CommentController {

    constructor(
        @inject(CommentService) private readonly service: CommentService,
    ) {}

    @boundMethod
    public async index(req: ITodoRequest, res: Response, next: NextFunction): Promise<Response> {
        const comments = await this.service.getList(req.todo);

        return res.json(comments);
    }
}
