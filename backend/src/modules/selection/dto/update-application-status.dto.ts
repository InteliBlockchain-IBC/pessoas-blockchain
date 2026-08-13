import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: [
      'DRAFT',
      'SUBMITTED',
      'IN_REVIEW',
      'APPROVED',
      'REJECTED',
      'WITHDRAWN',
    ],
  })
  @IsString()
  @IsIn([
    'DRAFT',
    'SUBMITTED',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN',
  ])
  status!: string;

  @ApiPropertyOptional({
    description:
      'Observações gerais da candidatura. Omitir mantém o valor atual.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
