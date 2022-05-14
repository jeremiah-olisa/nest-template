import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: config.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: config.get<string>('FACEBOOK_OAUTH_SCOPE'),
      profileFields: JSON.parse(
        config.get<string>('FACEBOOK_OAUTH_PROFILE_FIELDS'),
      ),
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ) {
    const { name, emails, gender } = profile;
    console.log(profile);
    const user = {
      email: emails[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      gender,
      profilePicture:
        profile?.photos && profile?.photos?.length > 1
          ? { url: profile?.photos[0]?.value }
          : null,
      accessToken,
    };
    done(null, user);
  }
}
