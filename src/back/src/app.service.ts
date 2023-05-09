import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class AppService {
  constructor(private moduleRef: ModuleRef) {}
}
