import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { IOtp } from '../../domain/models/otp.model';
import { OTP } from '../entities/otp.entity';
import { IOtpPort } from '../../domain/ports/otp.port';
import { OTP_REPOSITORY } from 'src/utils/services/constants';

@Injectable()
export class OTPRepositoryAdaptor implements IOtpPort {
  constructor(
    @Inject(OTP_REPOSITORY)
    private repository: Repository<OTP>,
  ) {}

  async save(otp: Partial<IOtp>): Promise<IOtp> {
    console.log('Saving OTP:', otp);
    try {
      const entity = this.repository.create(otp);
      const savedOTP = await this.repository.save(entity);
      console.log('OTP saved successfully:', savedOTP);
      return savedOTP;
    } catch (error) {
      console.error('Error saving OTP:', error);
      throw error;
    }
  }

  async verify(mobile: string, code: string): Promise<boolean> {
    const otp = await this.repository.findOne({
      where: {
        mobile,
        code,
        verified: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    console.log('Found OTP:', otp);

    if (!otp) return false;

    otp.verified = true;
    await this.repository.save(otp);
    return true;
  }

  async findPendingOTP(mobile: string): Promise<IOtp | null> {
    console.log(`Finding pending OTP for mobile: ${mobile}`);
    try {
      const otp = await this.repository.findOne({
        where: {
          mobile,
          verified: false,
          expiresAt: MoreThan(new Date()),
        },
        order: { expiresAt: 'DESC' },
      });
      console.log(`Pending OTP result:`, otp);
      return otp;
    } catch (error) {
      console.error('Error finding pending OTP:', error);
      throw error;
    }
  }

  async markAsVerified(id: string): Promise<void> {
    await this.repository.update(id, { verified: true });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
  async findByReference(reference: string): Promise<IOtp | null> {
    return this.repository.findOne({
      where: {
        reference,
        verified: false,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async deleteByReference(reference: string): Promise<void> {
    await this.repository.delete({ reference });
  }
}
