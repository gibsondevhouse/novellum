-------------------------------------
Translated Report (Full Report Below)
-------------------------------------
Process:             novellum [47387]
Path:                /Applications/Novellum.app/Contents/MacOS/novellum
Identifier:          com.gibsondevhouse.novellum
Version:             0.0.1 (0.0.1)
Code Type:           ARM-64 (Native)
Role:                Background
Parent Process:      launchd [1]
Coalition:           com.gibsondevhouse.novellum [3227]
User ID:             501

Date/Time:           2026-05-01 11:00:00.7819 -0400
Launch Time:         2026-05-01 10:59:44.0241 -0400
Hardware Model:      Mac16,12
OS Version:          macOS 26.3.1 (25D2128)
Release Type:        User

Crash Reporter Key:  624BBD5C-7B8B-BC3D-DD2E-53AB478ED7CC
Incident Identifier: D45B85C7-5FB9-456A-99C4-372C53C6B026

Sleep/Wake UUID:       1523A5AF-09F5-47FD-AB46-0C47A86ED1C7

Time Awake Since Boot: 14000 seconds
Time Since Wake:       354 seconds

System Integrity Protection: enabled

Triggered by Thread: 0  main, Dispatch Queue: com.apple.main-thread

Exception Type:    EXC_CRASH (SIGABRT)
Exception Codes:   0x0000000000000000, 0x0000000000000000

Termination Reason:  Namespace SIGNAL, Code 6, Abort trap: 6
Terminating Process: novellum [47387]


Application Specific Information:
abort() called


Thread 0 Crashed:: main Dispatch queue: com.apple.main-thread
0   libsystem_kernel.dylib        	       0x1948115b0 __pthread_kill + 8
1   libsystem_pthread.dylib       	       0x19484b888 pthread_kill + 296
2   libsystem_c.dylib             	       0x194750850 abort + 124
3   novellum                      	       0x1053d86e8 std::sys::pal::unix::abort_internal::he83a14397ef717ae + 12
4   novellum                      	       0x1053d9684 std::process::abort::h2f4325b8d66c2416 + 12
5   novellum                      	       0x10538e284 std::panicking::panic_with_hook::h93c775fc227522dd + 784
6   novellum                      	       0x10538de54 std::panicking::panic_handler::_$u7b$$u7b$closure$u7d$$u7d$::h8561e58c9391724a + 104
7   novellum                      	       0x10538a628 std::sys::backtrace::__rust_end_short_backtrace::h55629ed76aaa9d26 + 12
8   novellum                      	       0x10537b2f4 _RNvCsiGVaDesi5rv_7___rustc17rust_begin_unwind + 32
9   novellum                      	       0x1053dd630 core::panicking::panic_nounwind_fmt::hbccf1478dcdd0d51 + 52
10  novellum                      	       0x1053dd594 core::panicking::panic_nounwind::h6b2e5f463f7678f3 + 60
11  novellum                      	       0x1053dd734 core::panicking::panic_cannot_unwind::hf78649432160e0db + 24
12  novellum                      	       0x1052dd004 tao::platform_impl::platform::app_delegate::did_finish_launching::h358fdfbfcd95c34c + 344
13  CoreFoundation                	       0x1948e1494 __CFNOTIFICATIONCENTER_IS_CALLING_OUT_TO_AN_OBSERVER__ + 148
14  CoreFoundation                	       0x194945f54 ___CFXRegistrationPost_block_invoke + 92
15  CoreFoundation                	       0x194945e98 _CFXRegistrationPost + 436
16  CoreFoundation                	       0x1948bff94 _CFXNotificationPost + 740
17  Foundation                    	       0x196aea6d0 -[NSNotificationCenter postNotificationName:object:userInfo:] + 88
18  AppKit                        	       0x198d08ea0 -[NSApplication _postDidFinishNotification] + 308
19  AppKit                        	       0x198d08c38 -[NSApplication _sendFinishLaunchingNotification] + 172
20  AppKit                        	       0x19927c3a0 -[NSApplication(NSAppleEventHandling) _handleAEOpenEvent:] + 488
21  AppKit                        	       0x19927fba4 -[NSApplication(NSAppleEventHandling) _handleCoreEvent:withReplyEvent:] + 488
22  Foundation                    	       0x196a37a34 -[NSAppleEventManager dispatchRawAppleEvent:withRawReply:handlerRefCon:] + 316
23  Foundation                    	       0x1960f6688 _NSAppleEventManagerGenericHandler + 80
24  AE                            	       0x19cb500f4 0x19cb45000 + 45300
25  AE                            	       0x19cb4fa34 0x19cb45000 + 43572
26  AE                            	       0x19cb490e8 aeProcessAppleEvent + 484
27  HIToolbox                     	       0x1a13a97c8 AEProcessAppleEvent + 68
28  AppKit                        	       0x198d0410c _DPSNextEvent + 1296
29  AppKit                        	       0x1997caf08 -[NSApplication(NSEventRouting) _nextEventMatchingEventMask:untilDate:inMode:dequeue:] + 688
30  AppKit                        	       0x1997cac14 -[NSApplication(NSEventRouting) nextEventMatchingMask:untilDate:inMode:dequeue:] + 72
31  AppKit                        	       0x198cfc780 -[NSApplication run] + 368
32  novellum                      	       0x1050b1e74 tao::platform_impl::platform::event_loop::EventLoop$LT$T$GT$::run::hbfae108c66d80cd1 + 308
33  novellum                      	       0x10518b9f8 _$LT$tauri_runtime_wry..Wry$LT$T$GT$$u20$as$u20$tauri_runtime..Runtime$LT$T$GT$$GT$::run::h759dc564804b6bee + 216
34  novellum                      	       0x1051d6bc0 app_lib::run::hdf6e6fc266a80752 + 6388
35  novellum                      	       0x104fd0dc0 std::sys::backtrace::__rust_begin_short_backtrace::h8fe399c625835701 + 12
36  novellum                      	       0x104fd0da8 std::rt::lang_start::_$u7b$$u7b$closure$u7d$$u7d$::h2f864d1a43aaf0f6 + 16
37  novellum                      	       0x105383504 std::rt::lang_start_internal::h1e9a2dfabf97dcbe + 1024
38  novellum                      	       0x104fd0e1c main + 52
39  dyld                          	       0x194481d54 start + 7184

Thread 1:

Thread 2::  Dispatch queue: com.apple.WebKit.ServicesController
0   libsystem_kernel.dylib        	       0x19480aae4 __ulock_wait + 8
1   libdispatch.dylib             	       0x194690cec _dlock_wait + 56
2   libdispatch.dylib             	       0x194690b0c _dispatch_thread_event_wait_slow + 56
3   libdispatch.dylib             	       0x19469ec20 __DISPATCH_WAIT_FOR_QUEUE__ + 368
4   libdispatch.dylib             	       0x19469e7d8 _dispatch_sync_f_slow + 148
5   WebKit                        	       0x1bec4c688 void std::__1::__call_once_proxy[abi:sn200100]<std::__1::tuple<WebKit::ServicesController::refreshExistingServices(bool)::'block-literal'::$_8&&>>(void*) + 112
6   libc++.1.dylib                	       0x1947664e4 std::__1::__call_once(unsigned long volatile&, void*, void (*)(void*)) + 196
7   WebKit                        	       0x1bec496c4 invocation function for block in WebKit::ServicesController::refreshExistingServices(bool) + 360
8   libdispatch.dylib             	       0x19468eb5c _dispatch_call_block_and_release + 32
9   libdispatch.dylib             	       0x1946a8ad4 _dispatch_client_callout + 16
10  libdispatch.dylib             	       0x1946974e8 _dispatch_lane_serial_drain + 740
11  libdispatch.dylib             	       0x194697fc4 _dispatch_lane_invoke + 388
12  libdispatch.dylib             	       0x1946a2474 _dispatch_root_queue_drain_deferred_wlh + 292
13  libdispatch.dylib             	       0x1946a1d6c _dispatch_workloop_worker_thread + 692
14  libsystem_pthread.dylib       	       0x194847e4c _pthread_wqthread + 292
15  libsystem_pthread.dylib       	       0x194846b9c start_wqthread + 8

Thread 3:: com.apple.NSEventThread
0   libsystem_kernel.dylib        	       0x194808c34 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x19481b028 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x19481198c mach_msg_overwrite + 484
3   libsystem_kernel.dylib        	       0x194808fb4 mach_msg + 24
4   CoreFoundation                	       0x1948eabb0 __CFRunLoopServiceMachPort + 160
5   CoreFoundation                	       0x1948e9508 __CFRunLoopRun + 1188
6   CoreFoundation                	       0x1949a3f3c _CFRunLoopRunSpecificWithOptions + 532
7   AppKit                        	       0x198d93a34 _NSEventThread + 184
8   libsystem_pthread.dylib       	       0x19484bc08 _pthread_start + 136
9   libsystem_pthread.dylib       	       0x194846ba8 thread_start + 8

Thread 4:: JavaScriptCore libpas scavenger
0   libsystem_kernel.dylib        	       0x19480c4f8 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x19484c0dc _pthread_cond_wait + 984
2   JavaScriptCore                	       0x1b7793dd0 scavenger_thread_main + 1440
3   libsystem_pthread.dylib       	       0x19484bc08 _pthread_start + 136
4   libsystem_pthread.dylib       	       0x194846ba8 thread_start + 8

Thread 5:: WebCore: Scrolling
0   libsystem_kernel.dylib        	       0x194808c34 mach_msg2_trap + 8
1   libsystem_kernel.dylib        	       0x19481b028 mach_msg2_internal + 76
2   libsystem_kernel.dylib        	       0x19481198c mach_msg_overwrite + 484
3   libsystem_kernel.dylib        	       0x194808fb4 mach_msg + 24
4   CoreFoundation                	       0x1948eabb0 __CFRunLoopServiceMachPort + 160
5   CoreFoundation                	       0x1948e9508 __CFRunLoopRun + 1188
6   CoreFoundation                	       0x1949a3f3c _CFRunLoopRunSpecificWithOptions + 532
7   CoreFoundation                	       0x19493ca50 CFRunLoopRun + 64
8   JavaScriptCore                	       0x1b6150b50 WTF::Detail::CallableWrapper<WTF::RunLoop::create(WTF::ASCIILiteral, WTF::ThreadType, WTF::Thread::QOS)::$_0, void>::call() + 244
9   JavaScriptCore                	       0x1b619482c WTF::Thread::entryPoint(WTF::Thread::NewThreadContext*) + 260
10  JavaScriptCore                	       0x1b5f6228c WTF::wtfThreadEntryPoint(void*) + 16
11  libsystem_pthread.dylib       	       0x19484bc08 _pthread_start + 136
12  libsystem_pthread.dylib       	       0x194846ba8 thread_start + 8

Thread 6:: CVDisplayLink
0   libsystem_kernel.dylib        	       0x19480c4f8 __psynch_cvwait + 8
1   libsystem_pthread.dylib       	       0x19484c108 _pthread_cond_wait + 1028
2   CoreVideo                     	       0x19eeeeb3c CVDisplayLink::waitUntil(unsigned long long) + 336
3   CoreVideo                     	       0x19eeedc24 CVDisplayLink::runIOThread() + 500
4   libsystem_pthread.dylib       	       0x19484bc08 _pthread_start + 136
5   libsystem_pthread.dylib       	       0x194846ba8 thread_start + 8

Thread 7:


Thread 0 crashed with ARM Thread State (64-bit):
    x0: 0x0000000000000000   x1: 0x0000000000000000   x2: 0x0000000000000000   x3: 0x0000000000000000
    x4: 0x0000000001000000   x5: 0x0000000000000000   x6: 0x0000000000000005   x7: 0x0000000000000005
    x8: 0x73b14794e61f54fe   x9: 0x73b14796e6afa5fe  x10: 0x0000000000000002  x11: 0x0000010000000000
   x12: 0x00000000fffffffd  x13: 0x0000000000000000  x14: 0x0000000000000000  x15: 0x0000000000000000
   x16: 0x0000000000000148  x17: 0x00000002020d0fc0  x18: 0x0000000000000000  x19: 0x0000000000000006
   x20: 0x0000000000000103  x21: 0x0000000200b0f1e0  x22: 0x00000001056f38c8  x23: 0x0000000c8103d880
   x24: 0x00000001056fb000  x25: 0x0000000000041400  x26: 0x0000000000000000  x27: 0x0000001100000011
   x28: 0x000000016ae27838   fp: 0x000000016ae27430   lr: 0x000000019484b888
    sp: 0x000000016ae27410   pc: 0x00000001948115b0 cpsr: 0x40000000
   far: 0x0000000000000000  esr: 0x56000080 (Syscall)

Binary Images:
       0x104fd0000 -        0x1056cbfff com.gibsondevhouse.novellum (0.0.1) <db4cd525-a8d2-35f0-934e-320d1a07df39> /Applications/Novellum.app/Contents/MacOS/novellum
       0x117a84000 -        0x117a8ffff libobjc-trampolines.dylib (*) <f26af954-d1f7-31aa-9981-1bad216149d9> /usr/lib/libobjc-trampolines.dylib
       0x11993c000 -        0x11a173fff com.apple.AGXMetalG16G-B0 (345.20.4) <dc332c71-9d73-3321-bce0-19347abc333c> /System/Library/Extensions/AGXMetalG16G_B0.bundle/Contents/MacOS/AGXMetalG16G_B0
       0x1193d0000 -        0x119433fff com.apple.AppleMetalOpenGLRenderer (1.0) <66a35ba7-f2f4-3a44-9a0c-8440564e9578> /System/Library/Extensions/AppleMetalOpenGLRenderer.bundle/Contents/MacOS/AppleMetalOpenGLRenderer
       0x194808000 -        0x19484449f libsystem_kernel.dylib (*) <78ec33a6-6330-3836-8900-eb90836936e8> /usr/lib/system/libsystem_kernel.dylib
       0x194845000 -        0x194851acb libsystem_pthread.dylib (*) <0596a7b6-bce2-3f06-a2e8-3eaab5371ed8> /usr/lib/system/libsystem_pthread.dylib
       0x1946d7000 -        0x194759047 libsystem_c.dylib (*) <eb569350-0696-3397-838e-0344948107c0> /usr/lib/system/libsystem_c.dylib
       0x19488b000 -        0x194dd42bf com.apple.CoreFoundation (6.9) <646518bb-a6e8-3da7-ab32-9d97bcbdc25d> /System/Library/Frameworks/CoreFoundation.framework/Versions/A/CoreFoundation
       0x1960de000 -        0x197081c1f com.apple.Foundation (6.9) <187e7913-b154-30a7-8070-852767aac3cf> /System/Library/Frameworks/Foundation.framework/Versions/C/Foundation
       0x198ce4000 -        0x19a4106ff com.apple.AppKit (6.9) <bf94fd49-283d-3c62-8cf0-0a49c21b6129> /System/Library/Frameworks/AppKit.framework/Versions/C/AppKit
       0x19cb45000 -        0x19cbb95f7 com.apple.AE (944) <c2e75873-78f4-33be-b63b-d211345bac66> /System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/AE.framework/Versions/A/AE
       0x1a1393000 -        0x1a169627f com.apple.HIToolbox (2.1.1) <3c068ca7-e6a9-3e91-953a-b527a1892d05> /System/Library/Frameworks/Carbon.framework/Versions/A/Frameworks/HIToolbox.framework/Versions/A/HIToolbox
       0x194479000 -        0x194518713 dyld (*) <044cd67e-3a0a-3ca4-8bb3-a9687d5328fe> /usr/lib/dyld
               0x0 - 0xffffffffffffffff ??? (*) <00000000-0000-0000-0000-000000000000> ???
       0x19468d000 -        0x1946d3e5f libdispatch.dylib (*) <4c58ab31-f363-3e75-a8f8-302105812dbf> /usr/lib/system/libdispatch.dylib
       0x1be1d9000 -        0x1bf81bb5f com.apple.WebKit (21623) <c13188b8-0146-3f71-8e33-8f6808e4218a> /System/Library/Frameworks/WebKit.framework/Versions/A/WebKit
       0x19475a000 -        0x1947ecea3 libc++.1.dylib (*) <652836ca-32b1-3388-a72a-d6b90ddda958> /usr/lib/libc++.1.dylib
       0x1b5f5c000 -        0x1b798e29f com.apple.JavaScriptCore (21623) <fe18d222-b3fa-39cb-a89b-1001fa2d1878> /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/JavaScriptCore
       0x19eeeb000 -        0x19ef6f01f com.apple.CoreVideo (1.8) <67098f59-d15b-3748-bcb9-c8041ce75424> /System/Library/Frameworks/CoreVideo.framework/Versions/A/CoreVideo

External Modification Summary:
  Calls made by other processes targeting this process:
    task_for_pid: 0
    thread_create: 0
    thread_set_state: 0
  Calls made by this process:
    task_for_pid: 0
    thread_create: 0
    thread_set_state: 0
  Calls made by all processes on this machine:
    task_for_pid: 0
    thread_create: 0
    thread_set_state: 0

VM Region Summary:
ReadOnly portion of Libraries: Total=1.8G resident=0K(0%) swapped_out_or_unallocated=1.8G(100%)
Writable regions: Total=4.4G written=625K(0%) resident=625K(0%) swapped_out=0K(0%) unallocated=4.4G(100%)

                                VIRTUAL   REGION 
REGION TYPE                        SIZE    COUNT (non-coalesced) 
===========                     =======  ======= 
.note.gnu.proper                    320        1 
Activity Tracing                   256K        1 
AttributeGraph Data               1024K        1 
ColorSync                           32K        2 
CoreGraphics                        32K        2 
Foundation                          16K        1 
Kernel Alloc Once                   32K        1 
MALLOC                           113.2M       22 
MALLOC guard page                 3920K        4 
STACK GUARD                        112K        7 
Stack                             11.7M        8 
Stack Guard                       56.0M        1 
VM_ALLOCATE                        320K       15 
VM_ALLOCATE (reserved)             4.0G        2         reserved VM address space (unallocated)
WebKit Malloc                    192.1M        5 
WebKit Malloc (reserved)          64.0M        1         reserved VM address space (unallocated)
__AUTH                            5811K      637 
__AUTH_CONST                      88.0M     1014 
__CTF                               824        1 
__DATA                            34.5M      968 
__DATA_CONST                      32.8M     1023 
__DATA_DIRTY                      8412K      874 
__FONT_DATA                        2352        1 
__GLSLBUILTINS                    5176K        1 
__INFO_FILTER                         8        1 
__LINKEDIT                       592.1M        5 
__OBJC_RO                         78.4M        1 
__OBJC_RW                         2571K        1 
__TEXT                             1.2G     1045 
__TPRO_CONST                       128K        2 
mapped file                      269.9M       31 
page table in kernel               625K        1 
shared memory                     1376K       12 
===========                     =======  ======= 
TOTAL                              6.8G     5692 
TOTAL, minus reserved VM space     2.7G     5692 


-----------
Full Report
-----------

{"app_name":"novellum","timestamp":"2026-05-01 11:00:05.00 -0400","app_version":"0.0.1","slice_uuid":"db4cd525-a8d2-35f0-934e-320d1a07df39","build_version":"0.0.1","platform":1,"bundleID":"com.gibsondevhouse.novellum","share_with_app_devs":0,"is_first_party":0,"bug_type":"309","os_version":"macOS 26.3.1 (25D2128)","roots_installed":0,"name":"novellum","incident_id":"D45B85C7-5FB9-456A-99C4-372C53C6B026"}
{
  "uptime" : 14000,
  "procRole" : "Background",
  "version" : 2,
  "userID" : 501,
  "deployVersion" : 210,
  "modelCode" : "Mac16,12",
  "coalitionID" : 3227,
  "osVersion" : {
    "train" : "macOS 26.3.1",
    "build" : "25D2128",
    "releaseType" : "User"
  },
  "captureTime" : "2026-05-01 11:00:00.7819 -0400",
  "codeSigningMonitor" : 2,
  "incident" : "D45B85C7-5FB9-456A-99C4-372C53C6B026",
  "pid" : 47387,
  "translated" : false,
  "cpuType" : "ARM-64",
  "procLaunch" : "2026-05-01 10:59:44.0241 -0400",
  "procStartAbsTime" : 341558103666,
  "procExitAbsTime" : 341960246142,
  "procName" : "novellum",
  "procPath" : "\/Applications\/Novellum.app\/Contents\/MacOS\/novellum",
  "bundleInfo" : {"CFBundleShortVersionString":"0.0.1","CFBundleVersion":"0.0.1","CFBundleIdentifier":"com.gibsondevhouse.novellum"},
  "storeInfo" : {"deviceIdentifierForVendor":"304DBE64-7652-525F-8B97-C12968CFF949","thirdParty":true},
  "parentProc" : "launchd",
  "parentPid" : 1,
  "coalitionName" : "com.gibsondevhouse.novellum",
  "crashReporterKey" : "624BBD5C-7B8B-BC3D-DD2E-53AB478ED7CC",
  "appleIntelligenceStatus" : {"state":"available"},
  "developerMode" : 1,
  "codeSigningID" : "novellum-2864957033e92784",
  "codeSigningTeamID" : "",
  "codeSigningFlags" : 570556929,
  "codeSigningValidationCategory" : 10,
  "codeSigningTrustLevel" : 4294967295,
  "codeSigningAuxiliaryInfo" : 0,
  "instructionByteStream" : {"beforePC":"fyMD1f17v6n9AwCRFOD\/l78DAJH9e8Go\/w9f1sADX9YQKYDSARAA1A==","atPC":"AwEAVH8jA9X9e7+p\/QMAkQng\/5e\/AwCR\/XvBqP8PX9bAA1\/WcAqA0g=="},
  "bootSessionUUID" : "65B2FCB5-A879-429C-88FF-58DC14EAC528",
  "wakeTime" : 354,
  "sleepWakeUUID" : "1523A5AF-09F5-47FD-AB46-0C47A86ED1C7",
  "sip" : "enabled",
  "exception" : {"codes":"0x0000000000000000, 0x0000000000000000","rawCodes":[0,0],"type":"EXC_CRASH","signal":"SIGABRT"},
  "termination" : {"flags":0,"code":6,"namespace":"SIGNAL","indicator":"Abort trap: 6","byProc":"novellum","byPid":47387},
  "asi" : {"libsystem_c.dylib":["abort() called"]},
  "extMods" : {"caller":{"thread_create":0,"thread_set_state":0,"task_for_pid":0},"system":{"thread_create":0,"thread_set_state":0,"task_for_pid":0},"targeted":{"thread_create":0,"thread_set_state":0,"task_for_pid":0},"warnings":0},
  "faultingThread" : 0,
  "threads" : [{"threadState":{"x":[{"value":0},{"value":0},{"value":0},{"value":0},{"value":16777216},{"value":0},{"value":5},{"value":5},{"value":8336523090081043710},{"value":8336523098680436222},{"value":2},{"value":1099511627776},{"value":4294967293},{"value":0},{"value":0},{"value":0},{"value":328},{"value":8624345024},{"value":0},{"value":6},{"value":259},{"value":8601530848,"symbolLocation":224,"symbol":"_main_thread"},{"value":4386142408,"symbolLocation":4136,"symbol":"anon.11084123dca7e8209ea9134aa16086c0.32"},{"value":53704120448},{"value":4386172928,"symbolLocation":5376,"symbol":"crossbeam_utils::atomic::atomic_cell::lock::LOCKS::h294149460506af13"},{"value":267264},{"value":0},{"value":73014444049},{"value":6088194104}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6786693256},"cpsr":{"value":1073741824},"fp":{"value":6088193072},"sp":{"value":6088193040},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":6786454960,"matchesCrashFrame":1},"far":{"value":0}},"id":311595,"triggered":true,"name":"main","queue":"com.apple.main-thread","frames":[{"imageOffset":38320,"symbol":"__pthread_kill","symbolLocation":8,"imageIndex":4},{"imageOffset":26760,"symbol":"pthread_kill","symbolLocation":296,"imageIndex":5},{"imageOffset":497744,"symbol":"abort","symbolLocation":124,"imageIndex":6},{"imageOffset":4228840,"symbol":"std::sys::pal::unix::abort_internal::he83a14397ef717ae","symbolLocation":12,"imageIndex":0},{"imageOffset":4232836,"symbol":"std::process::abort::h2f4325b8d66c2416","symbolLocation":12,"imageIndex":0},{"imageOffset":3924612,"symbol":"std::panicking::panic_with_hook::h93c775fc227522dd","symbolLocation":784,"imageIndex":0},{"imageOffset":3923540,"symbol":"std::panicking::panic_handler::_$u7b$$u7b$closure$u7d$$u7d$::h8561e58c9391724a","symbolLocation":104,"imageIndex":0},{"imageOffset":3909160,"symbol":"std::sys::backtrace::__rust_end_short_backtrace::h55629ed76aaa9d26","symbolLocation":12,"imageIndex":0},{"imageOffset":3846900,"symbol":"_RNvCsiGVaDesi5rv_7___rustc17rust_begin_unwind","symbolLocation":32,"imageIndex":0},{"imageOffset":4249136,"symbol":"core::panicking::panic_nounwind_fmt::hbccf1478dcdd0d51","symbolLocation":52,"imageIndex":0},{"imageOffset":4248980,"symbol":"core::panicking::panic_nounwind::h6b2e5f463f7678f3","symbolLocation":60,"imageIndex":0},{"imageOffset":4249396,"symbol":"core::panicking::panic_cannot_unwind::hf78649432160e0db","symbolLocation":24,"imageIndex":0},{"imageOffset":3198980,"symbol":"tao::platform_impl::platform::app_delegate::did_finish_launching::h358fdfbfcd95c34c","symbolLocation":344,"imageIndex":0},{"imageOffset":353428,"symbol":"__CFNOTIFICATIONCENTER_IS_CALLING_OUT_TO_AN_OBSERVER__","symbolLocation":148,"imageIndex":7},{"imageOffset":765780,"symbol":"___CFXRegistrationPost_block_invoke","symbolLocation":92,"imageIndex":7},{"imageOffset":765592,"symbol":"_CFXRegistrationPost","symbolLocation":436,"imageIndex":7},{"imageOffset":216980,"symbol":"_CFXNotificationPost","symbolLocation":740,"imageIndex":7},{"imageOffset":10536656,"symbol":"-[NSNotificationCenter postNotificationName:object:userInfo:]","symbolLocation":88,"imageIndex":8},{"imageOffset":151200,"symbol":"-[NSApplication _postDidFinishNotification]","symbolLocation":308,"imageIndex":9},{"imageOffset":150584,"symbol":"-[NSApplication _sendFinishLaunchingNotification]","symbolLocation":172,"imageIndex":9},{"imageOffset":5866400,"symbol":"-[NSApplication(NSAppleEventHandling) _handleAEOpenEvent:]","symbolLocation":488,"imageIndex":9},{"imageOffset":5880740,"symbol":"-[NSApplication(NSAppleEventHandling) _handleCoreEvent:withReplyEvent:]","symbolLocation":488,"imageIndex":9},{"imageOffset":9804340,"symbol":"-[NSAppleEventManager dispatchRawAppleEvent:withRawReply:handlerRefCon:]","symbolLocation":316,"imageIndex":8},{"imageOffset":99976,"symbol":"_NSAppleEventManagerGenericHandler","symbolLocation":80,"imageIndex":8},{"imageOffset":45300,"imageIndex":10},{"imageOffset":43572,"imageIndex":10},{"imageOffset":16616,"symbol":"aeProcessAppleEvent","symbolLocation":484,"imageIndex":10},{"imageOffset":92104,"symbol":"AEProcessAppleEvent","symbolLocation":68,"imageIndex":11},{"imageOffset":131340,"symbol":"_DPSNextEvent","symbolLocation":1296,"imageIndex":9},{"imageOffset":11431688,"symbol":"-[NSApplication(NSEventRouting) _nextEventMatchingEventMask:untilDate:inMode:dequeue:]","symbolLocation":688,"imageIndex":9},{"imageOffset":11430932,"symbol":"-[NSApplication(NSEventRouting) nextEventMatchingMask:untilDate:inMode:dequeue:]","symbolLocation":72,"imageIndex":9},{"imageOffset":100224,"symbol":"-[NSApplication run]","symbolLocation":368,"imageIndex":9},{"imageOffset":925300,"symbol":"tao::platform_impl::platform::event_loop::EventLoop$LT$T$GT$::run::hbfae108c66d80cd1","symbolLocation":308,"imageIndex":0},{"imageOffset":1817080,"symbol":"_$LT$tauri_runtime_wry..Wry$LT$T$GT$$u20$as$u20$tauri_runtime..Runtime$LT$T$GT$$GT$::run::h759dc564804b6bee","symbolLocation":216,"imageIndex":0},{"imageOffset":2124736,"symbol":"app_lib::run::hdf6e6fc266a80752","symbolLocation":6388,"imageIndex":0},{"imageOffset":3520,"symbol":"std::sys::backtrace::__rust_begin_short_backtrace::h8fe399c625835701","symbolLocation":12,"imageIndex":0},{"imageOffset":3496,"symbol":"std::rt::lang_start::_$u7b$$u7b$closure$u7d$$u7d$::h2f864d1a43aaf0f6","symbolLocation":16,"imageIndex":0},{"imageOffset":3880196,"symbol":"std::rt::lang_start_internal::h1e9a2dfabf97dcbe","symbolLocation":1024,"imageIndex":0},{"imageOffset":3612,"symbol":"main","symbolLocation":52,"imageIndex":0},{"imageOffset":36180,"symbol":"start","symbolLocation":7184,"imageIndex":12}]},{"id":311660,"frames":[],"threadState":{"x":[{"value":6088781824},{"value":8451},{"value":6088245248},{"value":0},{"value":409602},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6088781824},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":6786673556},"far":{"value":0}}},{"id":311661,"threadState":{"x":[{"value":18446744073709551612},{"value":0},{"value":4294967295},{"value":0},{"value":8601549312,"symbolLocation":0,"symbol":"_dispatch_main_q"},{"value":2},{"value":6089352840},{"value":18446726482597246976},{"value":0},{"value":53712591056},{"value":8601549416,"symbolLocation":104,"symbol":"_dispatch_main_q"},{"value":5},{"value":53712591046},{"value":8601549360,"symbolLocation":48,"symbol":"_dispatch_main_q"},{"value":0},{"value":53712591046},{"value":515},{"value":8624345184},{"value":0},{"value":4294967295},{"value":1},{"value":0},{"value":6089353072},{"value":6089355488},{"value":0},{"value":53712591744},{"value":0},{"value":0},{"value":276}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6784879852},"cpsr":{"value":1073741824},"fp":{"value":6089352880},"sp":{"value":6089352848},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":6786427620},"far":{"value":0}},"queue":"com.apple.WebKit.ServicesController","frames":[{"imageOffset":10980,"symbol":"__ulock_wait","symbolLocation":8,"imageIndex":4},{"imageOffset":15596,"symbol":"_dlock_wait","symbolLocation":56,"imageIndex":14},{"imageOffset":15116,"symbol":"_dispatch_thread_event_wait_slow","symbolLocation":56,"imageIndex":14},{"imageOffset":72736,"symbol":"__DISPATCH_WAIT_FOR_QUEUE__","symbolLocation":368,"imageIndex":14},{"imageOffset":71640,"symbol":"_dispatch_sync_f_slow","symbolLocation":148,"imageIndex":14},{"imageOffset":10958472,"symbol":"void std::__1::__call_once_proxy[abi:sn200100]<std::__1::tuple<WebKit::ServicesController::refreshExistingServices(bool)::'block-literal'::$_8&&>>(void*)","symbolLocation":112,"imageIndex":15},{"imageOffset":50404,"symbol":"std::__1::__call_once(unsigned long volatile&, void*, void (*)(void*))","symbolLocation":196,"imageIndex":16},{"imageOffset":10946244,"symbol":"invocation function for block in WebKit::ServicesController::refreshExistingServices(bool)","symbolLocation":360,"imageIndex":15},{"imageOffset":7004,"symbol":"_dispatch_call_block_and_release","symbolLocation":32,"imageIndex":14},{"imageOffset":113364,"symbol":"_dispatch_client_callout","symbolLocation":16,"imageIndex":14},{"imageOffset":42216,"symbol":"_dispatch_lane_serial_drain","symbolLocation":740,"imageIndex":14},{"imageOffset":44996,"symbol":"_dispatch_lane_invoke","symbolLocation":388,"imageIndex":14},{"imageOffset":87156,"symbol":"_dispatch_root_queue_drain_deferred_wlh","symbolLocation":292,"imageIndex":14},{"imageOffset":85356,"symbol":"_dispatch_workloop_worker_thread","symbolLocation":692,"imageIndex":14},{"imageOffset":11852,"symbol":"_pthread_wqthread","symbolLocation":292,"imageIndex":5},{"imageOffset":7068,"symbol":"start_wqthread","symbolLocation":8,"imageIndex":5}]},{"id":311683,"name":"com.apple.NSEventThread","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592,"symbolLocation":928904,"symbol":"getAVTAvatarRecordSerializerClass.softClass"},{"value":131954280235008},{"value":0},{"value":131954280235008},{"value":2},{"value":4294967295},{"value":0},{"value":17179869184},{"value":0},{"value":2},{"value":0},{"value":0},{"value":30723},{"value":0},{"value":18446744073709551569},{"value":8624346840},{"value":0},{"value":4294967295},{"value":2},{"value":131954280235008},{"value":0},{"value":131954280235008},{"value":6091071624},{"value":8589934592,"symbolLocation":928904,"symbol":"getAVTAvatarRecordSerializerClass.softClass"},{"value":21592279046},{"value":18446744073709550527},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6786494504},"cpsr":{"value":0},"fp":{"value":6091071472},"sp":{"value":6091071392},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":6786419764},"far":{"value":0}},"frames":[{"imageOffset":3124,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":4},{"imageOffset":77864,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":4},{"imageOffset":39308,"symbol":"mach_msg_overwrite","symbolLocation":484,"imageIndex":4},{"imageOffset":4020,"symbol":"mach_msg","symbolLocation":24,"imageIndex":4},{"imageOffset":392112,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":160,"imageIndex":7},{"imageOffset":386312,"symbol":"__CFRunLoopRun","symbolLocation":1188,"imageIndex":7},{"imageOffset":1150780,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":532,"imageIndex":7},{"imageOffset":719412,"symbol":"_NSEventThread","symbolLocation":184,"imageIndex":9},{"imageOffset":27656,"symbol":"_pthread_start","symbolLocation":136,"imageIndex":5},{"imageOffset":7080,"symbol":"thread_start","symbolLocation":8,"imageIndex":5}]},{"id":311694,"name":"JavaScriptCore libpas scavenger","threadState":{"x":[{"value":260},{"value":0},{"value":39936},{"value":0},{"value":0},{"value":160},{"value":0},{"value":99999088},{"value":6091648680},{"value":0},{"value":0},{"value":2},{"value":2},{"value":0},{"value":0},{"value":0},{"value":305},{"value":8624344952},{"value":0},{"value":4772980800},{"value":4772980864},{"value":6091649248},{"value":99999088},{"value":0},{"value":39936},{"value":40193},{"value":40448},{"value":8570015744,"symbolLocation":4716912,"symbol":"pas_mar_global_registry"},{"value":8604164096,"symbolLocation":3400,"symbol":"bmalloc_common_primitive_heap_support"}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6786695388},"cpsr":{"value":1610612736},"fp":{"value":6091648800},"sp":{"value":6091648656},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":6786434296},"far":{"value":0}},"frames":[{"imageOffset":17656,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":4},{"imageOffset":28892,"symbol":"_pthread_cond_wait","symbolLocation":984,"imageIndex":5},{"imageOffset":25394640,"symbol":"scavenger_thread_main","symbolLocation":1440,"imageIndex":17},{"imageOffset":27656,"symbol":"_pthread_start","symbolLocation":136,"imageIndex":5},{"imageOffset":7080,"symbol":"thread_start","symbolLocation":8,"imageIndex":5}]},{"id":311710,"name":"WebCore: Scrolling","threadState":{"x":[{"value":268451845},{"value":21592279046},{"value":8589934592,"symbolLocation":928904,"symbol":"getAVTAvatarRecordSerializerClass.softClass"},{"value":237507396501504},{"value":0},{"value":237507396501504},{"value":2},{"value":4294967295},{"value":0},{"value":17179869184},{"value":0},{"value":2},{"value":0},{"value":0},{"value":55299},{"value":0},{"value":18446744073709551569},{"value":8624346840},{"value":0},{"value":4294967295},{"value":2},{"value":237507396501504},{"value":0},{"value":237507396501504},{"value":6093365192},{"value":8589934592,"symbolLocation":928904,"symbol":"getAVTAvatarRecordSerializerClass.softClass"},{"value":21592279046},{"value":18446744073709550527},{"value":4412409862}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6786494504},"cpsr":{"value":0},"fp":{"value":6093365040},"sp":{"value":6093364960},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":6786419764},"far":{"value":0}},"frames":[{"imageOffset":3124,"symbol":"mach_msg2_trap","symbolLocation":8,"imageIndex":4},{"imageOffset":77864,"symbol":"mach_msg2_internal","symbolLocation":76,"imageIndex":4},{"imageOffset":39308,"symbol":"mach_msg_overwrite","symbolLocation":484,"imageIndex":4},{"imageOffset":4020,"symbol":"mach_msg","symbolLocation":24,"imageIndex":4},{"imageOffset":392112,"symbol":"__CFRunLoopServiceMachPort","symbolLocation":160,"imageIndex":7},{"imageOffset":386312,"symbol":"__CFRunLoopRun","symbolLocation":1188,"imageIndex":7},{"imageOffset":1150780,"symbol":"_CFRunLoopRunSpecificWithOptions","symbolLocation":532,"imageIndex":7},{"imageOffset":727632,"symbol":"CFRunLoopRun","symbolLocation":64,"imageIndex":7},{"imageOffset":2050896,"symbol":"WTF::Detail::CallableWrapper<WTF::RunLoop::create(WTF::ASCIILiteral, WTF::ThreadType, WTF::Thread::QOS)::$_0, void>::call()","symbolLocation":244,"imageIndex":17},{"imageOffset":2328620,"symbol":"WTF::Thread::entryPoint(WTF::Thread::NewThreadContext*)","symbolLocation":260,"imageIndex":17},{"imageOffset":25228,"symbol":"WTF::wtfThreadEntryPoint(void*)","symbolLocation":16,"imageIndex":17},{"imageOffset":27656,"symbol":"_pthread_start","symbolLocation":136,"imageIndex":5},{"imageOffset":7080,"symbol":"thread_start","symbolLocation":8,"imageIndex":5}]},{"id":311757,"name":"CVDisplayLink","threadState":{"x":[{"value":260},{"value":0},{"value":0},{"value":0},{"value":0},{"value":65704},{"value":0},{"value":15651667},{"value":231681},{"value":0},{"value":0},{"value":2},{"value":2},{"value":0},{"value":0},{"value":0},{"value":305},{"value":8624344952},{"value":0},{"value":53711255096},{"value":53711255160},{"value":1},{"value":15651667},{"value":0},{"value":0},{"value":231681},{"value":231936},{"value":341960227037},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":6786695432},"cpsr":{"value":2684354560},"fp":{"value":6094515632},"sp":{"value":6094515488},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":6786434296},"far":{"value":0}},"frames":[{"imageOffset":17656,"symbol":"__psynch_cvwait","symbolLocation":8,"imageIndex":4},{"imageOffset":28936,"symbol":"_pthread_cond_wait","symbolLocation":1028,"imageIndex":5},{"imageOffset":15164,"symbol":"CVDisplayLink::waitUntil(unsigned long long)","symbolLocation":336,"imageIndex":18},{"imageOffset":11300,"symbol":"CVDisplayLink::runIOThread()","symbolLocation":500,"imageIndex":18},{"imageOffset":27656,"symbol":"_pthread_start","symbolLocation":136,"imageIndex":5},{"imageOffset":7080,"symbol":"thread_start","symbolLocation":8,"imageIndex":5}]},{"id":311979,"frames":[],"threadState":{"x":[{"value":6089928704},{"value":65563},{"value":6089392128},{"value":0},{"value":409604},{"value":18446744073709551615},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0},{"value":0}],"flavor":"ARM_THREAD_STATE64","lr":{"value":0},"cpsr":{"value":0},"fp":{"value":0},"sp":{"value":6089928704},"esr":{"value":1442840704,"description":"(Syscall)"},"pc":{"value":6786673556},"far":{"value":0}}}],
  "usedImages" : [
  {
    "source" : "P",
    "arch" : "arm64",
    "base" : 4378656768,
    "CFBundleShortVersionString" : "0.0.1",
    "CFBundleIdentifier" : "com.gibsondevhouse.novellum",
    "size" : 7323648,
    "uuid" : "db4cd525-a8d2-35f0-934e-320d1a07df39",
    "path" : "\/Applications\/Novellum.app\/Contents\/MacOS\/novellum",
    "name" : "novellum",
    "CFBundleVersion" : "0.0.1"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 4691869696,
    "size" : 49152,
    "uuid" : "f26af954-d1f7-31aa-9981-1bad216149d9",
    "path" : "\/usr\/lib\/libobjc-trampolines.dylib",
    "name" : "libobjc-trampolines.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 4724080640,
    "CFBundleShortVersionString" : "345.20.4",
    "CFBundleIdentifier" : "com.apple.AGXMetalG16G-B0",
    "size" : 8617984,
    "uuid" : "dc332c71-9d73-3321-bce0-19347abc333c",
    "path" : "\/System\/Library\/Extensions\/AGXMetalG16G_B0.bundle\/Contents\/MacOS\/AGXMetalG16G_B0",
    "name" : "AGXMetalG16G_B0",
    "CFBundleVersion" : "345.20.4"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 4718395392,
    "CFBundleShortVersionString" : "1.0",
    "CFBundleIdentifier" : "com.apple.AppleMetalOpenGLRenderer",
    "size" : 409600,
    "uuid" : "66a35ba7-f2f4-3a44-9a0c-8440564e9578",
    "path" : "\/System\/Library\/Extensions\/AppleMetalOpenGLRenderer.bundle\/Contents\/MacOS\/AppleMetalOpenGLRenderer",
    "name" : "AppleMetalOpenGLRenderer",
    "CFBundleVersion" : "1"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6786416640,
    "size" : 246944,
    "uuid" : "78ec33a6-6330-3836-8900-eb90836936e8",
    "path" : "\/usr\/lib\/system\/libsystem_kernel.dylib",
    "name" : "libsystem_kernel.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6786666496,
    "size" : 51916,
    "uuid" : "0596a7b6-bce2-3f06-a2e8-3eaab5371ed8",
    "path" : "\/usr\/lib\/system\/libsystem_pthread.dylib",
    "name" : "libsystem_pthread.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6785167360,
    "size" : 532552,
    "uuid" : "eb569350-0696-3397-838e-0344948107c0",
    "path" : "\/usr\/lib\/system\/libsystem_c.dylib",
    "name" : "libsystem_c.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6786953216,
    "CFBundleShortVersionString" : "6.9",
    "CFBundleIdentifier" : "com.apple.CoreFoundation",
    "size" : 5542592,
    "uuid" : "646518bb-a6e8-3da7-ab32-9d97bcbdc25d",
    "path" : "\/System\/Library\/Frameworks\/CoreFoundation.framework\/Versions\/A\/CoreFoundation",
    "name" : "CoreFoundation",
    "CFBundleVersion" : "4302"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6812459008,
    "CFBundleShortVersionString" : "6.9",
    "CFBundleIdentifier" : "com.apple.Foundation",
    "size" : 16399392,
    "uuid" : "187e7913-b154-30a7-8070-852767aac3cf",
    "path" : "\/System\/Library\/Frameworks\/Foundation.framework\/Versions\/C\/Foundation",
    "name" : "Foundation",
    "CFBundleVersion" : "4302"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6858620928,
    "CFBundleShortVersionString" : "6.9",
    "CFBundleIdentifier" : "com.apple.AppKit",
    "size" : 24299264,
    "uuid" : "bf94fd49-283d-3c62-8cf0-0a49c21b6129",
    "path" : "\/System\/Library\/Frameworks\/AppKit.framework\/Versions\/C\/AppKit",
    "name" : "AppKit",
    "CFBundleVersion" : "2685.40.108"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6924029952,
    "CFBundleShortVersionString" : "944",
    "CFBundleIdentifier" : "com.apple.AE",
    "size" : 476664,
    "uuid" : "c2e75873-78f4-33be-b63b-d211345bac66",
    "path" : "\/System\/Library\/Frameworks\/CoreServices.framework\/Versions\/A\/Frameworks\/AE.framework\/Versions\/A\/AE",
    "name" : "AE",
    "CFBundleVersion" : "944"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6999846912,
    "CFBundleShortVersionString" : "2.1.1",
    "CFBundleIdentifier" : "com.apple.HIToolbox",
    "size" : 3158656,
    "uuid" : "3c068ca7-e6a9-3e91-953a-b527a1892d05",
    "path" : "\/System\/Library\/Frameworks\/Carbon.framework\/Versions\/A\/Frameworks\/HIToolbox.framework\/Versions\/A\/HIToolbox",
    "name" : "HIToolbox"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6782685184,
    "size" : 653076,
    "uuid" : "044cd67e-3a0a-3ca4-8bb3-a9687d5328fe",
    "path" : "\/usr\/lib\/dyld",
    "name" : "dyld"
  },
  {
    "size" : 0,
    "source" : "A",
    "base" : 0,
    "uuid" : "00000000-0000-0000-0000-000000000000"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6784864256,
    "size" : 290400,
    "uuid" : "4c58ab31-f363-3e75-a8f8-302105812dbf",
    "path" : "\/usr\/lib\/system\/libdispatch.dylib",
    "name" : "libdispatch.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 7484575744,
    "CFBundleShortVersionString" : "21623",
    "CFBundleIdentifier" : "com.apple.WebKit",
    "size" : 23341920,
    "uuid" : "c13188b8-0146-3f71-8e33-8f6808e4218a",
    "path" : "\/System\/Library\/Frameworks\/WebKit.framework\/Versions\/A\/WebKit",
    "name" : "WebKit",
    "CFBundleVersion" : "21623.2.7.11.7"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6785703936,
    "size" : 601764,
    "uuid" : "652836ca-32b1-3388-a72a-d6b90ddda958",
    "path" : "\/usr\/lib\/libc++.1.dylib",
    "name" : "libc++.1.dylib"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 7347748864,
    "CFBundleShortVersionString" : "21623",
    "CFBundleIdentifier" : "com.apple.JavaScriptCore",
    "size" : 27468448,
    "uuid" : "fe18d222-b3fa-39cb-a89b-1001fa2d1878",
    "path" : "\/System\/Library\/Frameworks\/JavaScriptCore.framework\/Versions\/A\/JavaScriptCore",
    "name" : "JavaScriptCore",
    "CFBundleVersion" : "21623.2.7.11.7"
  },
  {
    "source" : "P",
    "arch" : "arm64e",
    "base" : 6961410048,
    "CFBundleShortVersionString" : "1.8",
    "CFBundleIdentifier" : "com.apple.CoreVideo",
    "size" : 540704,
    "uuid" : "67098f59-d15b-3748-bcb9-c8041ce75424",
    "path" : "\/System\/Library\/Frameworks\/CoreVideo.framework\/Versions\/A\/CoreVideo",
    "name" : "CoreVideo",
    "CFBundleVersion" : "726.2"
  }
],
  "sharedCache" : {
  "base" : 6781599744,
  "size" : 5820792832,
  "uuid" : "674db25a-34b2-3c56-8bd4-7d78005b2f2e"
},
  "vmSummary" : "ReadOnly portion of Libraries: Total=1.8G resident=0K(0%) swapped_out_or_unallocated=1.8G(100%)\nWritable regions: Total=4.4G written=625K(0%) resident=625K(0%) swapped_out=0K(0%) unallocated=4.4G(100%)\n\n                                VIRTUAL   REGION \nREGION TYPE                        SIZE    COUNT (non-coalesced) \n===========                     =======  ======= \n.note.gnu.proper                    320        1 \nActivity Tracing                   256K        1 \nAttributeGraph Data               1024K        1 \nColorSync                           32K        2 \nCoreGraphics                        32K        2 \nFoundation                          16K        1 \nKernel Alloc Once                   32K        1 \nMALLOC                           113.2M       22 \nMALLOC guard page                 3920K        4 \nSTACK GUARD                        112K        7 \nStack                             11.7M        8 \nStack Guard                       56.0M        1 \nVM_ALLOCATE                        320K       15 \nVM_ALLOCATE (reserved)             4.0G        2         reserved VM address space (unallocated)\nWebKit Malloc                    192.1M        5 \nWebKit Malloc (reserved)          64.0M        1         reserved VM address space (unallocated)\n__AUTH                            5811K      637 \n__AUTH_CONST                      88.0M     1014 \n__CTF                               824        1 \n__DATA                            34.5M      968 \n__DATA_CONST                      32.8M     1023 \n__DATA_DIRTY                      8412K      874 \n__FONT_DATA                        2352        1 \n__GLSLBUILTINS                    5176K        1 \n__INFO_FILTER                         8        1 \n__LINKEDIT                       592.1M        5 \n__OBJC_RO                         78.4M        1 \n__OBJC_RW                         2571K        1 \n__TEXT                             1.2G     1045 \n__TPRO_CONST                       128K        2 \nmapped file                      269.9M       31 \npage table in kernel               625K        1 \nshared memory                     1376K       12 \n===========                     =======  ======= \nTOTAL                              6.8G     5692 \nTOTAL, minus reserved VM space     2.7G     5692 \n",
  "legacyInfo" : {
  "threadTriggered" : {
    "name" : "main",
    "queue" : "com.apple.main-thread"
  }
},
  "logWritingSignature" : "ba8f196dfaa7d017d9dea8a5006f2f779fbd52e2",
  "roots_installed" : 0,
  "bug_type" : "309",
  "trmStatus" : 1,
  "trialInfo" : {
  "rollouts" : [
    {
      "rolloutId" : "670ea6eb7a111748a97092a4",
      "factorPackIds" : [
        "68db21af3b3ace402427b77b"
      ],
      "deploymentId" : 240000189
    },
    {
      "rolloutId" : "66d35d7fe4d6bf7664f40ddf",
      "factorPackIds" : [
        "68c1a34bd359577bbe8f2182"
      ],
      "deploymentId" : 240000069
    }
  ],
  "experiments" : [

  ]
}
}

Model: Mac16,12, BootROM 13822.81.10, proc 10:4:6:0 processors, 16 GB, SMC 
Graphics: Apple M4, Apple M4, Built-In
Display: Color LCD, 2560 x 1664 Retina, Main, MirrorOff, Online
Memory Module: LPDDR5, Hynix
AirPort: spairport_wireless_card_type_wifi (0x14E4, 0x4388), wl0: Dec  6 2025 00:30:14 version 23.41.8.0.41.51.201 FWID 01-990604ea
IO80211_driverkit-1540.16 "IO80211_driverkit-1540.16" Jan 27 2026 21:02:00
AirPort: 
Bluetooth: Version (null), 0 services, 0 devices, 0 incoming serial ports
Network Service: Wi-Fi, AirPort, en0
Thunderbolt Bus: MacBook Air, Apple Inc.
Thunderbolt Bus: MacBook Air, Apple Inc.
