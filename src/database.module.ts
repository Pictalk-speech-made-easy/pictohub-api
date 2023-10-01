import { Module } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [],
  providers: [{
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<Db> => {
      try {
        const client = await MongoClient.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/?retryWrites=true&w=majority`);
        return client.db('pictohub');
      } catch (e) {
        throw e;
      }
    }
  },],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
