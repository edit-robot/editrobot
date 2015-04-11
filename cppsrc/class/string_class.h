#pragma once
#include "StdAfx.h"

#ifndef __STDIO_H__
	#define __STDIO_H__
	#include <stdio.h>
#endif

#include "base_class.h"

class string_class :
	public base_class
{
public:
	string_class(void);
	~string_class(void);

	// 字符串
	char *str;

	// 二进制数据
	char *bin;
	long bin_size;

	//出栈的临时数据
	char *pop_date;
	Element * str_Element,* str_end, * str_Element_p;

	// 设置字符串
	void set_str(char *str);
	// 控制台打印字符串
	void printf_str(void);
	// 切割字符串
	char split(char * delims);
	// 压入字符串
	char push_back(char * str);
	// 弹出字符串
	char * pop_back(void);
	// 打印链表
	void print_r(void);
	// 替换字符串
	void replace(char * replace_end,char * delims);
	// 重置链表
	void reset_element(void);
	// 计算链表总字符串长度
	unsigned long element_str_length(void);
	// 计算链表总长度
	unsigned long element_length(void);
	// 合并字符串
	char * join(char * delims);
	// 设置二进制数据
	bool read_file_in_bin(char *file_name);
	// 将二进制数据一次性写入文件
	bool bin_write_to_file(char * file_name);
	// 将文本文件读入
	bool set_str_from_file(char * file_name);
	// 替换字符串
	int replace_str(char *sMatchStr, char *sReplaceStr);
	// 将文本写入文件
	bool str_write_to_file(char * file_name);
};


string_class::string_class(void)
	: str(0)
	, bin(NULL)
{
	this->pop_date = (char *)malloc(sizeof(char));	//初始化出栈缓冲区
	this->str = (char *)malloc(sizeof(char)*2);		//为字符串指针分配空间
	strcpy(this->str,"!");							//对字符串进行初始化
	buildElement(&str_Element);						//初始化链表
	str_end = str_Element;							//初始化链表末端指针.
	this->bin = (char *)malloc(sizeof(char));		//为二进制指针分配空间
	*(this->bin) = 33;
	bin_size = 1;
}

string_class::~string_class(void)
{
	free(this->str);								//释放字符串
	free(this->pop_date);							//释放出栈缓冲区
	DestroyElement(&str_Element);					//销毁链表
	free(this->bin);								//释放字符串
}

// 设置字符串
void string_class::set_str(char *temp_str)
{
	free(this->str);				//释放字符串
	(this->str) = (char *)malloc(sizeof(char)*(strlen(temp_str)+1));//为字符串指针分配空间
	strcpy(this->str,temp_str);
}

// 控制台打印字符串
void string_class::printf_str(void)
{
	printf("%s\n",this->str);
}

// 切割字符串
char string_class::split(char * delims)
{
	reset_element();//重置链表
	char *temp_str_free_p = (char *)malloc(sizeof(char)*(strlen(this->str)+1));

		char *temp_str = temp_str_free_p;
		strcpy(temp_str,this->str);
		int str_int = strlen(this->str);
		int temp_str_int = strlen(temp_str);
		char Single_temp_str[2];
		if(delims == ""){
			Single_temp_str[1] = '\0';
			while(*temp_str != '\0'){
				Single_temp_str[0] = *temp_str;
				this->push_back(Single_temp_str);
				temp_str++;
			}
		}
		else{
			char *result = strtok( temp_str, delims );
			while( result != NULL ){
				this->push_back(result);
				result = strtok( NULL, delims );
			}
		}

	free(temp_str_free_p);
	return 0;
}

// 压入字符串
char string_class::push_back(char * str)
{
	str_end = plusElement(&str_end);
	ModificationElement(&str_end,str);
	return 0;
}

// 弹出字符串
char * string_class::pop_back(void)
{
	free(this->pop_date);
	this->pop_date = (char *)malloc(sizeof(char)*(strlen(str_end->Content)+1));
	strcpy(this->pop_date,str_end->Content);
	if(str_Element != str_end){
		str_end = MinusElement(&str_end);
	}
	else{
		return NULL;
	}
	return (this->pop_date);
}

// 打印链表
void string_class::print_r(void)
{
	unsigned long count = 0;
	str_Element_p = str_Element;
	while(str_Element_p != str_end){
		str_Element_p = str_Element_p->Next;
		count++;
		printf("%lu:%s\n",count,str_Element_p->Content);
	}
	printf("\n");
}

// 替换字符串
void string_class::replace(char * replace_end,char * delims)
{
	reset_element();//重置链表
	char *temp_str = this->str;
	while((*temp_str) != '\0'){
		if((*temp_str) == (*delims)){
			(*temp_str) = (*replace_end);
		}
		temp_str++;
	}
}

// 重置链表
void string_class::reset_element(void)
{
	DestroyElement(&str_Element);
	buildElement(&str_Element);
	str_end = str_Element;
}

// 计算链表总字符串长度
unsigned long string_class::element_str_length(void)
{
	unsigned long count = 0;
	int count_temp = 0;
	str_Element_p = str_Element;
	while(str_Element_p != str_end){
		str_Element_p = str_Element_p->Next;
		count_temp = strlen(str_Element_p->Content);
		count += count_temp;
	}
	return count;
}

// 计算链表总长度
unsigned long string_class::element_length(void)
{
	unsigned long count = 0;
	str_Element_p = str_Element;
	while(str_Element_p != str_end){
		str_Element_p = str_Element_p->Next;
		count ++;
	}
	return count;
}

// 合并字符串
char * string_class::join(char * delims)
{
	int delims_length = 0;
	delims_length = strlen(delims);//获得替换字符串的长度
	unsigned long count = (unsigned long)(element_str_length()+((this->element_length()-1)*delims_length));
	free(this->str);//释放字符串
	this->str = (char *)malloc(sizeof(char)*(count+1));//为字符串指针分配空间

	str_Element_p = str_Element->Next;
	strcpy(this->str,str_Element_p->Content);
	while(str_Element_p != str_end){
		str_Element_p = str_Element_p->Next;
		strcat(this->str,delims);
		strcat(this->str,str_Element_p->Content);
	}
	this->reset_element();
	return this->str;
}


// 将文件二进制读入
bool string_class::read_file_in_bin(char *file_name)
{
	long lastPos;
	FILE *File=fopen(file_name,"rb");
	if(!File){
		lastPos = 0;
		return false;
	}

	free(this->bin);								//释放字符串
	long currentPos = ftell(File);    //取得当前文件指针位置,可能已经移动了文件指针
	fseek(File, 0, SEEK_END);//移动到文件的结尾
	lastPos = ftell(File);//获得文件大小
	fseek(File,currentPos,SEEK_SET);//恢复到原来的文件指针位置
	this->bin_size = lastPos;//设置二进制尺寸
	this->bin = (char *)malloc(sizeof(char)*(this->bin_size));//为二进制数据指针分配空间
	
	while(!feof(File))
	{
		fread(this->bin, sizeof(char), this->bin_size, File);
	}

	fclose(File);

	return true;
}

// 将二进制数据一次性写入文件
bool string_class::bin_write_to_file(char * file_name)
{
	FILE *File=fopen(file_name,"wb");
	if(!File){
		return false;
	}
	if(0 != this->bin_size){
		fwrite(this->bin, sizeof(char), this->bin_size, File);
	}
	fclose(File);
	return true;
}

// 将文本文件读入
bool string_class::set_str_from_file(char * file_name)
{
	char *bin_end;
	long lastPos;
	FILE *File=fopen(file_name,"rb");
	if(!File){
		lastPos = 0;
		return false;
	}

	free(this->bin);								//释放字符串
	long currentPos = ftell(File);    //取得当前文件指针位置,可能已经移动了文件指针
	fseek(File, 0, SEEK_END);//移动到文件的结尾
	lastPos = ftell(File);//获得文件大小
	fseek(File,currentPos,SEEK_SET);//恢复到原来的文件指针位置
	this->bin_size = lastPos;//设置二进制尺寸
	this->bin = (char *)malloc(sizeof(char)*(this->bin_size+1));//为二进制数据指针分配空间
	bin_end = this->bin + this->bin_size;
	while(!feof(File))
	{
		fread(this->bin, sizeof(char), this->bin_size, File);
	}
	bin_end = '\0';
	this->set_str(this->bin);

	fclose(File);
	return true;
}

int string_class::replace_str(char *sMatchStr, char *sReplaceStr)
{
        int  StringLen;
        char caNewString[2048];

        char *FindPos = strstr(this->str, sMatchStr);
        if( (!FindPos) || (!sMatchStr) )
                return -1;

        while( FindPos )
        {
                memset(caNewString, 0, sizeof(caNewString));
                StringLen = FindPos - this->str;
                strncpy(caNewString, this->str, StringLen);
                strcat(caNewString, sReplaceStr);
                strcat(caNewString, FindPos + strlen(sMatchStr));
				this->set_str(caNewString);

                FindPos = strstr(this->str, sMatchStr);
        }

        return 0;
}

// 将文本写入文件
bool string_class::str_write_to_file(char * file_name)
{
	FILE *File=fopen(file_name,"wb");
	if(!File){
		return false;
	}
	int str_len = strlen(this->str);
	if(0 != str_len){
		fwrite(this->str, sizeof(char), str_len, File);
	}
	fclose(File);
	return true;
}