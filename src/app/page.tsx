"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp,
  Clock,
  MapPin,
  Banknote,
  Star,
  Phone,
  CheckCircle2,
  ArrowLeft,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Play
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const floatAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-[family-name:var(--font-cairo)] overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40 pointer-events-none" />
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50" />
              <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-2xl">
                <Wallet className="w-7 h-7 text-white" />
              </div>
            </div>
            <span className="text-3xl font-black tracking-tight">محفظة</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5 text-base">
                دخول
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 h-12 rounded-xl text-base transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25">
                ابدأ مجاناً
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        <section className="min-h-screen flex items-center justify-center pt-20 pb-32 px-4 relative">
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-2.5 rounded-full text-sm font-semibold mb-8"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-4 h-4" />
                <span>أكثر من 500+ وسيط يثقون بنا</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
                <span className="text-white">ضاعف أرباحك</span>
                <br />
                <span className="bg-gradient-to-l from-emerald-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  في 30 يوم
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                نظام ذكي لإدارة عمليات 
                <span className="text-emerald-400 font-bold"> فودافون كاش </span>
                و
                <span className="text-emerald-400 font-bold"> انستاباي </span>
                - تابع كل جنيه، كل عملية، كل موظف
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="lg" 
                      className="text-xl px-12 h-16 rounded-2xl bg-gradient-to-l from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black font-bold shadow-2xl shadow-emerald-500/30 transition-all gap-3"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <span>ابدأ مجاناً - بدون بطاقة</span>
                      <motion.div animate={{ x: isHovered ? -5 : 0 }}>
                        <ArrowLeft className="w-6 h-6" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </Link>
                <Link href="#demo">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 h-16 rounded-2xl border-2 border-zinc-700 hover:border-zinc-500 bg-transparent hover:bg-white/5 text-white gap-3"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    شاهد العرض التوضيحي
                  </Button>
                </Link>
              </div>

              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              >
                <motion.div variants={item} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">+500</div>
                  <div className="text-zinc-500 text-sm">وسيط نشط</div>
                </motion.div>
                <motion.div variants={item} className="text-center border-x border-zinc-800">
                  <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">10K+</div>
                  <div className="text-zinc-500 text-sm">عملية يومياً</div>
                </motion.div>
                <motion.div variants={item} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">99%</div>
                  <div className="text-zinc-500 text-sm">رضا العملاء</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-emerald-400 rounded-full" />
            </div>
          </motion.div>
        </section>

        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Star className="w-4 h-4 fill-current" />
                <span>المشاكل اللي بتواجهك</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                عارف الإحساس ده؟
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                كل يوم بتضيع وقت وفلوس بسبب...
              </p>
            </motion.div>

            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
            >
              {[
                { icon: "❌", title: "حسابات غلط", desc: "الموظف نسي يسجل عملية والفلوس ضاعت" },
                { icon: "📝", title: "كراسة وورق", desc: "بتكتب كل حاجة يدوي وبتاخد وقت كتير" },
                { icon: "😰", title: "مش عارف أرباحك", desc: "آخر الشهر مش فاهم كسبت كام بالظبط" },
              ].map((problem, i) => (
                <motion.div 
                  key={i} 
                  variants={item}
                  className="bg-gradient-to-b from-red-500/5 to-transparent border border-red-500/10 rounded-3xl p-8 text-center"
                >
                  <div className="text-5xl mb-4">{problem.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-red-400">{problem.title}</h3>
                  <p className="text-zinc-500">{problem.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/20 via-emerald-500/5 to-transparent rounded-[40px] blur-3xl" />
              <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[40px] p-12 md:p-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-emerald-500/20 p-3 rounded-2xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold">الحل مع محفظة</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    "كل العمليات بتتسجل أوتوماتيك",
                    "العمولات بتتحسب لوحدها",
                    "تقارير يومية وأسبوعية وشهرية",
                    "تابع كل فرع وكل موظف لوحده",
                    "اشتغل من الموبايل في أي مكان",
                    "دعم فني 24/7 عبر واتساب",
                  ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                      <span className="text-lg text-zinc-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                ليه <span className="text-emerald-400">+500 وسيط</span> اختاروا محفظة؟
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                مميزات حقيقية بتفرق معاك كل يوم
              </p>
            </motion.div>

            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: TrendingUp,
                  color: "emerald",
                  title: "تقارير أرباح لحظية",
                  desc: "شوف كم كسبت النهارده، الأسبوع ده، أو أي فترة تختارها"
                },
                {
                  icon: MapPin,
                  color: "blue",
                  title: "إدارة فروع متعددة",
                  desc: "عندك أكتر من محل؟ تابع كل فرع بالتفصيل من مكان واحد"
                },
                {
                  icon: Users,
                  color: "violet",
                  title: "متابعة الموظفين",
                  desc: "اعرف كل موظف عمل كام عملية وحقق كام في اليوم"
                },
                {
                  icon: Banknote,
                  color: "amber",
                  title: "حساب عمولات تلقائي",
                  desc: "حدد نسبتك والنظام هيحسب أرباحك من كل عملية"
                },
                {
                  icon: Phone,
                  color: "rose",
                  title: "يشتغل من الموبايل",
                  desc: "تصميم متجاوب يشتغل على أي جهاز بدون مشاكل"
                },
                {
                  icon: Shield,
                  color: "teal",
                  title: "آمان وخصوصية",
                  desc: "بياناتك محمية ومشفرة - محدش يقدر يوصلها غيرك"
                },
              ].map((feature, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="h-full bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300 group hover:bg-zinc-900">
                    <CardContent className="p-8">
                      <div className={`w-14 h-14 bg-${feature.color}-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                      <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-emerald-600 via-emerald-500 to-teal-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
          
          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                animate={floatAnimation}
                className="inline-block mb-8"
              >
                <div className="bg-white/20 backdrop-blur p-6 rounded-3xl">
                  <Wallet className="w-16 h-16 text-white" />
                </div>
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
                جاهز تبدأ؟
              </h2>
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto">
                سجّل الآن وابدأ تتبع أرباحك من أول يوم
                <br />
                <span className="font-bold">مجاناً - بدون بطاقة - بدون عقود</span>
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {[
                  "تفعيل فوري",
                  "دعم واتساب 24/7",
                  "بدون رسوم خفية",
                  "إلغاء في أي وقت",
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 bg-black/20 backdrop-blur px-5 py-3 rounded-full"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
              
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    className="text-2xl px-16 h-20 rounded-3xl font-black bg-white text-emerald-600 hover:bg-white/90 shadow-2xl shadow-black/20 transition-all gap-3"
                  >
                    <span>ابدأ الآن مجاناً</span>
                    <ArrowLeft className="w-7 h-7" />
                  </Button>
                </motion.div>
              </Link>
              
              <p className="mt-6 text-white/60 text-sm">
                +500 وسيط سجّلوا الشهر الماضي
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-32 relative">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <TrendingUp className="w-4 h-4" />
                <span>قارن بنفسك</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                محفظة vs <span className="text-green-500">Excel</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                ليه تتعب نفسك بالإكسيل لما فيه حل أسهل وأسرع؟
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="p-6 text-right text-zinc-400 font-medium">المميزات</th>
                      <th className="p-6 text-center bg-emerald-500/10 border-x border-emerald-500/20">
                        <div className="flex items-center justify-center gap-2">
                          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl">
                            <Wallet className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xl font-bold text-emerald-400">محفظة</span>
                        </div>
                      </th>
                      <th className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="bg-green-600 p-2 rounded-xl">
                            <span className="text-white font-bold text-sm">X</span>
                          </div>
                          <span className="text-xl font-bold text-green-500">Excel</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "تسجيل العمليات", mahfza: "تلقائي وفوري", excel: "يدوي وبطيء" },
                      { feature: "حساب العمولات", mahfza: "أوتوماتيك 100%", excel: "معادلات معقدة" },
                      { feature: "تقارير الأرباح", mahfza: "ضغطة زر واحدة", excel: "ساعات من العمل" },
                      { feature: "متابعة الموظفين", mahfza: "لحظية ومفصلة", excel: "غير متاح" },
                      { feature: "إدارة الفروع", mahfza: "مركزية وسهلة", excel: "ملفات متفرقة" },
                      { feature: "الوصول من الموبايل", mahfza: "في أي وقت ومكان", excel: "صعب ومحدود" },
                      { feature: "حماية البيانات", mahfza: "مشفرة ومؤمنة", excel: "معرضة للضياع" },
                      { feature: "الأخطاء البشرية", mahfza: "صفر أخطاء", excel: "أخطاء كتير" },
                      { feature: "وقت التعلم", mahfza: "5 دقائق", excel: "أيام أو أسابيع" },
                      { feature: "الدعم الفني", mahfza: "24/7 واتساب", excel: "اسأل جوجل!" },
                    ].map((row, i) => (
                      <motion.tr 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="p-5 text-right font-medium text-zinc-300">{row.feature}</td>
                        <td className="p-5 text-center bg-emerald-500/5 border-x border-emerald-500/10">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">{row.mahfza}</span>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-zinc-500">{row.excel}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-10 text-center"
              >
                <p className="text-2xl font-bold text-zinc-300 mb-6">
                  وفّر <span className="text-emerald-400">+10 ساعات</span> أسبوعياً من العمل اليدوي
                </p>
                <Link href="/register">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 h-14 rounded-xl text-lg transition-all hover:scale-105 gap-2">
                    <span>جرّب محفظة مجاناً</span>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                أسئلة شائعة
              </h2>
            </motion.div>

            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                {
                  q: "هل النظام مجاني فعلاً؟",
                  a: "أيوه، تقدر تبدأ مجاناً بدون أي رسوم. لما تكبر وتحتاج مميزات أكتر، هنكون موجودين."
                },
                {
                  q: "محتاج تدريب علشان أستخدمه؟",
                  a: "لأ خالص! النظام سهل جداً وأي حد يقدر يستخدمه. وكمان فيه فيديوهات شرح ودعم فني لو احتجت."
                },
                {
                  q: "بياناتي آمنة؟",
                  a: "طبعاً. كل بياناتك مشفرة ومحمية. محدش يقدر يوصلها غيرك."
                },
                {
                  q: "يشتغل على الموبايل؟",
                  a: "أيوه، النظام متوافق مع كل الأجهزة: موبايل، تابلت، وكمبيوتر."
                },
              ].map((faq, i) => (
                <motion.div 
                  key={i} 
                  variants={item}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 transition-colors"
                >
                  <h3 className="text-lg font-bold mb-2 text-white">{faq.q}</h3>
                  <p className="text-zinc-400">{faq.a}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">محفظة</span>
            </div>
            <div className="flex items-center gap-6 text-zinc-500">
              <Link href="/login" className="hover:text-white transition-colors">دخول</Link>
              <Link href="/register" className="hover:text-white transition-colors">تسجيل</Link>
            </div>
            <p className="text-zinc-600 text-sm">
              © {new Date().getFullYear()} محفظة - صُنع بحب في مصر
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
