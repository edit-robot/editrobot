#pragma once
#include "StdAfx.h"
#include "base_class.h"

#ifndef __STDIO_H__
	#define __STDIO_H__
	#include <stdio.h>
#endif


class file_class :
	public base_class
{
public:
	file_class(void);
	~file_class(void);
	// 拷贝文件
	static int copy_file(char *infile, char *outfile);
	// 文件列表
	static int show_file_list(char *file_path);
	// 获取文件大小
	long file_size(char * file_name);
};

file_class::file_class(void){}

file_class::~file_class(void){}


int file_class::copy_file(char *infile, char *outfile)
{
    FILE *input,*output;
    char temp;
    if(strcmp(infile,outfile)!=0 && ((input=fopen(infile,"rb"))!=NULL) && ((output=fopen(outfile,"wb"))!=NULL))
	{
		while(!feof(input))
		{
			fread(&temp,1,1,input);
			fwrite(&temp,1,1,output);
		}
		fclose(input);
		fclose(output);
		return 0;
	}
	else{
		return 1;
	}
	return 0;
}


// 文件列表
int file_class::show_file_list(char *file_path)
{
    //struct _finddata_t {
        //unsigned    attrib;
            /*
                attrib，就是所查找文件的属性：
                    _A_ARCH（存档）、
                    _A_HIDDEN（隐藏）、
                    _A_NORMAL（正常）、
                    _A_RDONLY（只读）、 
                    _A_SUBDIR（文件夹）、
                    _A_SYSTEM（系统）。
            */
        //time_t      time_create;    //创建文件的时间
        //time_t      time_access;   //最后一次访问文件的时间
        //time_t      time_write;       //文件最后被修改的时间
        //_fsize_t    size;         //文件大小
        //char        name[260];    //文件名
    //};
    int file_number = 0;
    struct _finddata_t file;
	long k;
	long handle;
	k = handle = _findfirst( file_path, &file );
	while( k != -1 ){
        if(file.attrib != _A_SUBDIR){
            printf("file :%s\n",file.name);
        }
		else{
			printf("dir :%s\n",file.name);
		}
		++file_number;
		k = _findnext( handle, &file );
	}
	_findclose( handle );
	return 0;
}

///////////////////////////////////////////////////////////////////////////////////////////////
//使用c函数获取文件大小
//5/11/2007 9:31:34 AM
//取得当前文件指针位置函数:
//long ftell(FILE *stream );
//如果文件指针位于文件尾，则取得了文件大小。
//int fseek(FILE *stream,long offset,int origin );
//stream:Pointer to FILE structure. 
//offset:Number of bytes from origin.
//origin:Initial position. 可以取下面的值
//SEEK_CUR:Current position of file pointer. 
//SEEK_END:End of file. 
//SEEK_SET:Beginning of file. 
//例如：取一个文件大小：
//  //传入使用fopen打开的文件结构指针 File
//  int currentPos = ftell(File);    //取得当前文件指针位置,可能已经移动了文件指针
//  fseek(File, 0, SEEK_END);//移动到文件的结尾
//  int lastPos = ftell(File);//获得文件大小
//  fseek(File,currentPos,SEEK_SET);//恢复到原来的文件指针位置
//  return lastPos;
//如果文件大于 4G ,就要用64 位的 __int64 _ftelli64( FILE *stream );
//删除文件可以使用函数: int _unlink(const char *filename );  
//获取当前路径是: char *_getcwd(char *buffer,   int maxlen );
//
//如果文件大于 4G ,就要用64 位的 __int64 _ftelli64( FILE *stream );
// 获取文件大小
long file_class::file_size(char * file_name)
{
	long lastPos;
	FILE *File=fopen(file_name,"rb");
	if(!File){
		lastPos = 0;
	}else{
		long currentPos = ftell(File);    //取得当前文件指针位置,可能已经移动了文件指针
		fseek(File, 0, SEEK_END);//移动到文件的结尾
		lastPos = ftell(File);//获得文件大小
		fseek(File,currentPos,SEEK_SET);//恢复到原来的文件指针位置
		fclose(File);
	}
	return lastPos;
}
