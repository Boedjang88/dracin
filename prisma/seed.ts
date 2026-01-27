import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma'
import path from 'path'
import bcrypt from 'bcryptjs'

// Create better-sqlite3 adapter with absolute path to dev.db
const adapter = new PrismaBetterSqlite3({
    url: path.resolve(__dirname, 'dev.db')
})

const prisma = new PrismaClient({ adapter })

interface CastMember {
    name: string
    role: string
    image?: string
}

interface DramaData {
    title: string
    description: string
    posterUrl: string
    bannerUrl: string
    tags: string[]
    cast: CastMember[]
    vibe: string
    releaseYear: number
    totalEpisodes: number
}

// Free sample video URLs for testing
// These are public domain / creative commons videos
const TEST_VIDEO_URLS = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
]

const dramas: DramaData[] = [
    {
        title: "The Untamed (陈情令)",
        description: "Two talented disciples from respectable clans meet during their youth and form a close bond. Sixteen years later, they reunite to solve a series of mysteries linked to the past. This epic tale of friendship, sacrifice, and the blurred lines between good and evil captivated millions worldwide.",
        posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
        tags: ["Wuxia", "Fantasy", "Friendship", "Mystery", "Action"],
        cast: [
            { name: "Xiao Zhan", role: "Wei Wuxian" },
            { name: "Wang Yibo", role: "Lan Wangji" },
            { name: "Meng Ziyi", role: "Wen Qing" },
            { name: "Xuan Lu", role: "Jiang Yanli" }
        ],
        vibe: "Wuxia",
        releaseYear: 2019,
        totalEpisodes: 12
    },
    {
        title: "Love O2O (微微一笑很倾城)",
        description: "Bei Weiwei, a computer science major and top-ranked player in an online RPG game, catches the attention of Xiao Nai, the school's most popular student and gaming legend. Their in-game marriage leads to real-life romance in this sweet tech campus love story.",
        posterUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200",
        tags: ["Romance", "Modern", "Gaming", "Campus", "Sweet"],
        cast: [
            { name: "Yang Yang", role: "Xiao Nai" },
            { name: "Zheng Shuang", role: "Bei Weiwei" },
            { name: "Mao Xiaotong", role: "Er Xi" }
        ],
        vibe: "ModernRomance",
        releaseYear: 2016,
        totalEpisodes: 10
    },
    {
        title: "Nirvana in Fire (琅琊榜)",
        description: "After surviving a devastating betrayal that killed his entire army, Lin Shu returns to the capital under a new identity as the brilliant strategist Mei Changsu. He secretly orchestrates political maneuvers to clear his family's name and bring justice to those who wronged them.",
        posterUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
        tags: ["Historical", "Political", "Strategy", "Revenge", "Drama"],
        cast: [
            { name: "Hu Ge", role: "Mei Changsu / Lin Shu" },
            { name: "Liu Tao", role: "Princess Nihuang" },
            { name: "Wang Kai", role: "Prince Jing" },
            { name: "Wu Lei", role: "Fei Liu" }
        ],
        vibe: "HistoricalRomance",
        releaseYear: 2015,
        totalEpisodes: 12
    },
    {
        title: "You Are My Glory (你是我的荣耀)",
        description: "Famous actress Qiao Jingjing reconnects with her former high school crush, Yu Tu, a talented aerospace engineer. As she asks for his help in improving her gaming skills for a brand endorsement, old feelings resurface between the celebrity and the unassuming scientist.",
        posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
        tags: ["Romance", "Modern", "Gaming", "Aerospace", "Reunion"],
        cast: [
            { name: "Yang Yang", role: "Yu Tu" },
            { name: "Dilraba Dilmurat", role: "Qiao Jingjing" },
            { name: "Pan Yueming", role: "Zhai Liang" }
        ],
        vibe: "GreenFlag",
        releaseYear: 2021,
        totalEpisodes: 11
    },
    {
        title: "Hidden Love (偷偷藏不住)",
        description: "Sang Zhi develops a secret crush on her older brother's best friend, Duan Jiaxu. Years pass as she quietly nurtures her feelings from afar. When fate unexpectedly brings them together again in college, she finally has the chance to turn her hidden love into reality.",
        posterUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400",
        bannerUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200",
        tags: ["Romance", "Youth", "Secret Crush", "Sweet", "SlowBurn"],
        cast: [
            { name: "Zhao Lusi", role: "Sang Zhi" },
            { name: "Chen Zheyuan", role: "Duan Jiaxu" },
            { name: "Victor Ma", role: "Sang Yan" }
        ],
        vibe: "HeartWrenching",
        releaseYear: 2023,
        totalEpisodes: 10
    }
]

const episodeTitles: Record<string, string[]> = {
    "The Untamed (陈情令)": [
        "Encounter at Cloud Recesses",
        "The Mysterious Melody",
        "Lan Wangji's Test",
        "Secrets of the Yin Iron",
        "The Night Hunt",
        "Betrayal and Tragedy",
        "Sixteen Years Later",
        "Reunion at Mo Village",
        "The Fierce Corpse Appears",
        "Truth of the Past",
        "The Final Sacrifice",
        "Eternal Bond"
    ],
    "Love O2O (微微一笑很倾城)": [
        "The In-Game Divorce",
        "Meeting the Great Master",
        "Gaming Under Moonlight",
        "The In-Game Wedding",
        "Real Life Encounter",
        "Behind the Screen",
        "The Basketball Game",
        "Creating Dreams Together",
        "Conference Showdown",
        "Happy Ending Online and Offline"
    ],
    "Nirvana in Fire (琅琊榜)": [
        "Return to the Capital",
        "The Strategist Arrives",
        "Choosing the Prince",
        "Dismantling the Marquis",
        "Imperial Court Battles",
        "The Masked Hero",
        "Uncovering Old Wounds",
        "A Friend's Sacrifice",
        "The Truth Revealed",
        "Royal Confrontation",
        "Father and Son",
        "Justice at Last"
    ],
    "You Are My Glory (你是我的荣耀)": [
        "High School Reunion",
        "The Gaming Coach",
        "Chasing Stars",
        "Rocket Dreams",
        "Celebrity Troubles",
        "Under the Same Sky",
        "When Worlds Collide",
        "Long Distance Hearts",
        "Public Love",
        "Choosing Your Glory",
        "Forever and Always"
    ],
    "Hidden Love (偷偷藏不住)": [
        "The First Meeting",
        "Brother's Best Friend",
        "Secret Glances",
        "Growing Up Waiting",
        "College Reunion",
        "Hidden No More",
        "Confessions",
        "Love Acknowledged",
        "Meeting the Family",
        "Our Happy Ending"
    ]
}

function generateEpisodes(dramaTitle: string, episodeCount: number) {
    const episodes = []
    const baseDuration = 2700 // 45 minutes in seconds
    const titles = episodeTitles[dramaTitle] || []

    for (let i = 1; i <= episodeCount; i++) {
        const duration = baseDuration + Math.floor(Math.random() * 600) - 300 // 40-50 minutes

        // Use rotating test video URLs
        const videoUrl = TEST_VIDEO_URLS[(i - 1) % TEST_VIDEO_URLS.length]

        episodes.push({
            title: titles[i - 1] || `Episode ${i}`,
            thumbnail: `https://picsum.photos/seed/${dramaTitle.replace(/[^a-z0-9]/gi, '')}-ep${i}/300/180`,
            videoUrl,
            duration,
            episodeNumber: i
        })
    }

    return episodes
}

async function main() {
    console.log('🌱 Starting database seed...')

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.watchHistory.deleteMany()
    await prisma.watchlist.deleteMany()
    await prisma.episode.deleteMany()
    await prisma.drama.deleteMany()
    await prisma.user.deleteMany()

    // Create test user
    console.log('👤 Creating test user...')

    // Hash password properly for testing: "password123"
    const hashedPassword = await bcrypt.hash('password123', 10)

    const testUser = await prisma.user.create({
        data: {
            email: 'test@dracin.app',
            password: hashedPassword,
            name: 'Test User',
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
        }
    })
    console.log(`  ✓ Created user: ${testUser.email}`)

    // Create dramas with episodes
    console.log('🎬 Creating dramas with episodes...')
    for (const dramaData of dramas) {
        const episodes = generateEpisodes(dramaData.title, dramaData.totalEpisodes)

        const drama = await prisma.drama.create({
            data: {
                title: dramaData.title,
                description: dramaData.description,
                posterUrl: dramaData.posterUrl,
                bannerUrl: dramaData.bannerUrl,
                tags: JSON.stringify(dramaData.tags), // JSON-encode for SQLite
                cast: JSON.stringify(dramaData.cast), // JSON-encode for SQLite
                vibe: dramaData.vibe,
                releaseYear: dramaData.releaseYear,
                totalEpisodes: dramaData.totalEpisodes,
                episodes: {
                    create: episodes
                }
            },
            include: {
                episodes: true
            }
        })

        console.log(`  ✓ Created "${drama.title}" with ${drama.episodes.length} episodes`)
    }

    // Summary
    const dramaCount = await prisma.drama.count()
    const episodeCount = await prisma.episode.count()

    console.log('\n✅ Seed completed successfully!')
    console.log(`   📺 Dramas: ${dramaCount}`)
    console.log(`   🎞️  Episodes: ${episodeCount}`)
    console.log(`   👤 Users: 1`)
    console.log('\n📹 Using Google sample videos for testing video player')
    console.log('\n🔑 Test Credentials:')
    console.log('   Email: test@dracin.app')
    console.log('   Password: password123')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
