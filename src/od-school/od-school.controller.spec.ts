import { Test, TestingModule } from '@nestjs/testing';
import { OdSchoolController } from './od-school.controller';

describe('OdSchoolController', () => {
  let controller: OdSchoolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OdSchoolController],
    }).compile();

    controller = module.get<OdSchoolController>(OdSchoolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
