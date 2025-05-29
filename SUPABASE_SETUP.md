# SnakePit Supabase Integration Setup

This guide will help you set up Supabase authentication and database for the SnakePit game.

## 🚀 Quick Setup

### 1. Supabase Project Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use your existing project
3. Note down your project URL and anon key (already configured in `.env`)

### 2. Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `user_profiles` table for user data
- `game_sessions` table for game history
- `leaderboards` table for high scores
- `transactions` table for financial records
- Row Level Security (RLS) policies
- Automatic triggers for user profile creation and stats updates

### 3. Authentication Setup

The authentication is already configured to work with:
- Email/password signup and login
- Automatic user profile creation
- Session management

### 4. Environment Variables

Your `.env` file is already configured with:
```
REACT_APP_SUPABASE_URL=https://pldmsydujkljhuscbvfb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎮 Features Implemented

### Authentication
- ✅ User registration with username
- ✅ Email/password login
- ✅ Session persistence
- ✅ Automatic profile creation

### User Profiles
- ✅ Username and XRP balance tracking
- ✅ Audio preferences (mute/volume)
- ✅ Game statistics (total games, wins, earnings)
- ✅ Profile updates

### Game Statistics
- ✅ Game session recording
- ✅ Leaderboards (Classic and Warfare modes)
- ✅ High score tracking
- ✅ Game duration tracking

### Financial System
- ✅ XRP balance management
- ✅ Wager deduction on game start
- ✅ Transaction history (deposits, withdrawals, wagers, cashouts)
- ✅ Cashout recording

### Real-time Features
- ✅ Live leaderboard updates
- ✅ Real-time balance updates
- ✅ Session state management

## 🔧 Database Tables

### user_profiles
- User account information
- XRP balance
- Game statistics
- Audio preferences

### game_sessions
- Individual game records
- Scores, duration, mode
- Cashout status

### leaderboards
- High scores per game mode
- Automatic updates via triggers

### transactions
- Financial transaction history
- Deposits, withdrawals, wagers, cashouts

## 🎯 Usage

### For Players
1. Click "START PLAYING" on the home screen
2. Sign up or log in when prompted
3. Select wager amount and game mode
4. Play the game - stats are automatically tracked
5. View leaderboards by clicking the trophy icon

### For Developers
The integration provides:
- `useAuth()` hook for authentication state
- `GameStatsService` for game result tracking
- Supabase client in `src/lib/supabase.ts`
- Pre-built UI components for auth and leaderboards

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Public read access for leaderboards
- Secure authentication with Supabase Auth

## 🚨 Important Notes

1. **Database Setup Required**: You must run the SQL schema in your Supabase project
2. **Environment Variables**: Ensure `.env` file is not committed to version control
3. **RLS Policies**: The database has security policies that prevent unauthorized access
4. **Automatic Triggers**: User profiles and stats are updated automatically

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to save game result"**
   - Check if database schema is properly set up
   - Verify user is authenticated
   - Check browser console for detailed errors

2. **Authentication not working**
   - Verify Supabase URL and anon key in `.env`
   - Check if email confirmation is required in Supabase settings

3. **Leaderboard not updating**
   - Ensure database triggers are properly created
   - Check RLS policies allow read access to leaderboards

### Debug Mode
Enable debug logging by checking browser console for:
- Authentication state changes
- Database operation results
- Game statistics saving

## 🔄 Next Steps

Future enhancements could include:
- Real-time multiplayer with Supabase Realtime
- XRP wallet integration
- Advanced analytics dashboard
- Tournament system
- Social features (friends, chat)

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database schema is correctly set up
3. Ensure all environment variables are configured
4. Check Supabase project settings and RLS policies
