import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sendgrid from '@sendgrid/mail';
import mailOptions from './mail-options';

@Injectable()
export class EmailService {
  private SENDGRID_API_KEY;
  private EMAIL_FROM;
  constructor(private readonly configService: ConfigService) {
    this.SENDGRID_API_KEY = this.configService.get<string>('SENDGRID_API_KEY');
    this.EMAIL_FROM = this.configService.get<string>('EMAIL_FROM');
  }

  async sendMail(mailOptions: mailOptions) {
    try {
      const { to, subject, text, html } = mailOptions;
      sendgrid.setApiKey(this.SENDGRID_API_KEY);

      const msg = {
        to, // Change to your recipient
        from: this.EMAIL_FROM, // Change to your verified sender
        subject,
        text,
        html: text || html,
      };

      let result = await sendgrid.send(msg);

      return result;
    } catch (error: any) {
      // console.error(error || error?.message);

      // if (error?.response) {
      // console.error(error?.response?.body)
      // }

      throw new InternalServerErrorException(
        error?.message || error?.response?.body || error,
      );
    }

    // .then((response) => {
    //     console.log(response[0].statusCode)
    //     console.log(response[0].headers)
    // })
    // .catch((error) => {
    //     console.error(error)
    // })
  }
}
