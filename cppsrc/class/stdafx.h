// stdafx.h : 标准系统包含文件的包含文件，
// 或是经常使用但不常更改的
// 特定于项目的包含文件
//

#pragma once
#pragma execution_character_set("utf-8") //默认使用UTF8
/////////////////////////////////////////////////////////////////////////////
//此处为调试模块
#ifdef _DEBUG  
	#define New   new(_NORMAL_BLOCK, __FILE__, __LINE__)  
	#define CRTDBG_MAP_ALLOC
#endif

#ifndef __STDLIB_H__
	#define __STDLIB_H__
	#include <stdlib.h>
#endif

#ifdef _DEBUG
	#ifndef __CRTDBG_H__
		#define __CRTDBG_H__
		#include <crtdbg.h>
	#endif
#endif
/*
	在函数开头的地方放置：_CrtSetDbgFlag ( _CRTDBG_ALLOC_MEM_DF | _CRTDBG_LEAK_CHECK_DF );
	_CrtMemState s1, s2, s3;
	
	在开头的地方放置该函数可以获得自动中断参数为申请的第n次内存块:    _CrtSetBreakAlloc(n);

	对内存映像进行第一次拍照:  _CrtMemCheckpoint( &s1 );
			此处放置待检测的代码块。
	对内存映像进行第二次拍照:  _CrtMemCheckpoint( &s2 );

	对内存映像进行对比： if ( _CrtMemDifference( &s3, &s1, &s2) )
        _CrtMemDumpStatistics( &s3 );

	在函数结尾处方式该函数:  _CrtDumpMemoryLeaks();
*/
/////////////////////////////////////////////////////////////////////////////

// #ifndef _TARGETVER_H_
	// #define _TARGETVER_H_
	// #include "targetver.h"
// #endif

#ifndef __STDIO_H__
	#define __STDIO_H__
	#include <stdio.h>
#endif

#ifndef __TCHAR_H__
	#define __TCHAR_H__
	#include <tchar.h>
#endif

#ifndef __NEURONS_H__
	#define __NEURONS_H__
	#include "Neurons.h"
#endif

#ifndef __IOSTREAM__
	#define __IOSTREAM__
	#include <iostream>
#endif

#ifndef __VECTOR__
	#define __VECTOR__
	#include <vector>
#endif

//STL算法algorithm
#ifndef __ALGORITHM__
	#define __ALGORITHM__
	#include <algorithm>
#endif

//STL迭代器iterator
#ifndef __ITERATOR__
	#define __ITERATOR__
	#include <iterator>
#endif

//字符串头文件
#ifndef __STRING__
	#define __STRING__
	#include <string>
#endif

#ifndef __IO_H__
	#define __IO_H__
	#include <io.h>
#endif

#ifndef __PROCESS_H__
	#define __PROCESS_H__
	#include <process.h>  // 用于 _beginthread()函数
#endif
// TODO: 在此处引用程序需要的其他头文件
