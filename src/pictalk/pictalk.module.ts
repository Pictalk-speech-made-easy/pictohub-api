import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule } from '@nestjs/config';
import { PictalkController } from './pictalk.controller';
import { PictalkService } from './pictalk.service';
import {
  AuthGuard,
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
} from 'nest-keycloak-connect';
import keycloakConfig from 'src/config/keycloak.config';
import elasticsearchConfig from 'src/config/elasticsearch.config';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeormConfig from 'src/config/typeorm.config';
import { User } from './entities/user.entity';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [keycloakConfig, elasticsearchConfig, typeormConfig],
    }),
    ElasticsearchModule.register(elasticsearchConfig()),
    KeycloakConnectModule.register(keycloakConfig()),
    TypeOrmModule.forRoot(typeormConfig()),
    TypeOrmModule.forFeature([User]),
  ],

  providers: [
    PictalkService,
    // This adds a global level authentication guard,
    // you can also have it scoped
    // if you like.
    //
    // Will return a 401 unauthorized when it is unable to
    // verify the JWT token or Bearer header is missing.
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // This adds a global level resource guard, which is permissive.
    // Only controllers annotated with (http://twitter.com/Resource) and
    // methods with @Scopes
    // are handled by this guard.
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    // New in 1.1.0
    // This adds a global level role guard, which is permissive.
    // Used by @Roles decorator with the
    // optional @AllowAnyRole decorator for allowing any
    // specified role passed.
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  controllers: [PictalkController],
  exports: [PictalkService, ElasticsearchModule],
})
export class PictalkModule {
  constructor(private dataSource: DataSource) {}
}
