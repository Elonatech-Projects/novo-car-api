import { Test, TestingModule } from '@nestjs/testing';
import { OdSchoolService } from './od-school.service';

describe('OdSchoolService', () => {
  let service: OdSchoolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OdSchoolService],
    }).compile();

    service = module.get<OdSchoolService>(OdSchoolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
